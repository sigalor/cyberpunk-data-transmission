const fs = require("fs-extra");
const path = require("path");
const psnr = require("psnr");
const PNG = require("pngjs").PNG;

function parsePNG(filename, options) {
	return new Promise((resolve, reject) => {
		fs.readFile(filename).then(res => {
			new PNG(options).parse(res, function(error, data) {
				if(error) {
					reject(error);
					return;
				}
				resolve(data);
			});
		});
	});
}

function RGBAtoGrayscale(img, width, fromX = 0, moveDown = 0, bgColor = 0xff, inverted = false) {
	let res = Buffer.allocUnsafe(width*img.height);
	for(let y = 0; y < img.height; y++) {
		for(let x = 0; x < width; x++) {
			if(y < moveDown)
				res[y*width+x] = bgColor;
			else {
				let i = (y-moveDown)*img.width*4 + (x+fromX)*4;
				let val = (img.data[i]+img.data[i+1]+img.data[i+2]) / 3;
				res[y*width+x] = inverted ? 255-val: val;
			}
		}
	}
	return res;
}

async function loadAllChars(dir) {
	let transformName = n => {
		let idx = ["PLUS", "SLASH", "SPACE"].indexOf(n);
		if(idx !== -1)
			return ["+", "/", " "][idx];
		return n;
	}
	return (await Promise.all((await fs.readdir(dir)).map(async f => ({name: transformName(f.split('.')[0]), img: RGBAtoGrayscale(await parsePNG(path.join(dir, f)), 20)}))));
}

function extractChars(data, origWidth, origHeight, charWidth, charHeight) {
	let rowLength = origWidth/charWidth, colLength = origHeight/charHeight;
	let res = new Array(rowLength*colLength).fill(0).map(x => Buffer.allocUnsafe(charWidth*charHeight));
	for(let y = 0; y < origHeight; y++) {
		let currCharBaseIdx = Math.floor(y / charHeight) * rowLength;
		let inCharOffset = (y % charHeight) * charWidth;
		for(let x = 0; x < rowLength; x++) {
			let dataIdx = y*origWidth+x*charWidth;
			data.copy(res[currCharBaseIdx+x], inCharOffset, dataIdx, dataIdx+charWidth)
		}
	}
	return res;
}

function chunkArray(arr, n) {
	let res = [];
	while(arr.length > 0) {
		res.push(arr.slice(0, n));
		arr = arr.slice(n);
	}
	return res;
}

function numDiffChars(a, b) {
	let diff = 0;
	for(let i = 0; i < Math.min(a.length, b.length); i++)
		if(a.charAt(i) !== b.charAt(i))
			diff++;
	return diff + Math.abs(a.length-b.length);
}

function joinLines(a, b) {
	for(let i = 0; i < b.length-1; i++) {
		let diff = numDiffChars(b[i], b[i+1])
		if(diff < 50)
			throw `screen tearing detected between line ${i} and ${i+1}, numDiffChars=${diff}`;
	}

	if(a.length == 0) return b;
	if(b.length == 0) return a;
	let idx = -1;
	for(let i = a.length-1; i >= 0; i--) {
		if(a[i] === b[0]) {
			idx = i;
			break;
		}
	}
	if(idx == -1  ||  a.length-idx-1 > b.length) {
		console.error(["unjoinable", a, b]);
		throw "unjoinable";
	}
	return a.slice(0, idx).concat(b);
}

(async () => {
	console.log("Loading characters...");
	let chars = await loadAllChars(path.join(__dirname, "chars"));
	let res = [];

	for(let f of (await fs.readdir(path.join(__dirname, "full"))).sort()) {
		console.log(`Parsing ${f}...`);
		let data = extractChars(RGBAtoGrayscale((await parsePNG(path.join(__dirname, "full", f))), 1440, 269, 2, 0xff, true), 1440, 1080, 20, 40);

		let parsed = data.map(e => chars.reduce((prev, curr) => {
			if(prev == null)
				return curr;
			return psnr(e, curr.img) > psnr(e, prev.img) ? curr : prev;
		}));

		try {
			let scores = chunkArray(parsed.map((p, i) => psnr(p.img, data[i])), 72).map(e => {
				let filt = e.filter(x => x < Infinity)
				return filt.reduce((a,b) => a+b, 0) / filt.length;
			}).forEach((x, i) => { if(x < 30) throw `certainty in line ${i} is too low: ${x}`; })
			
			res = joinLines(res, chunkArray(parsed.map(p => p.name).join("").trim(), 72).filter(l => l.length === 72 && l.indexOf(" ") === -1));
		}
		catch(e) {
			console.error(`${f}: ${e}`);
		}

		fs.writeFile("output.png", Buffer.from(res.join(""), "base64"));
	}
})();
