#!/bin/bash

trap exit INT

if [ "$1" == "" ]; then
	echo "usage: $0 [input png file]"
	exit
fi

mkdir -p tmp
convert $1 -level 55%,75%,1.0 -crop 1440x1078+269+0 -negate -background white -gravity south -extent 1440x1080 tmp/input_color_corrected.png

for y in $(seq 0 40 1079); do
	for x in $(seq 0 20 1439); do
		convert tmp/input_color_corrected.png +repage -crop 20x40+$x+$y tmp/curr_char.png
	
		curr_max_similarity=-1
		character=NONE
		for c in chars/*.png; do
			compare "$c" tmp/curr_char.png tmp/difference.png
			similarity=$(compare -metric PSNR "$c" tmp/curr_char.png tmp/difference.png 2>&1)
			if [ "$similarity" == "inf" ]; then
				similarity=99999999
			fi
			if [ "$(echo $similarity'>'$curr_max_similarity | bc -l)" == "1" ]; then
				curr_max_similarity=$similarity
				character=$(basename -s .png "$c")
				if [ "$character" == "SLASH" ]; then
					character="/"
				elif [ "$character" == "PLUS" ]; then
					character="+"
				elif [ "$character" == "SPACE" ]; then
					character=" "
				fi
			fi
		done
		printf "$character"
	done
done

rm -rf tmp
