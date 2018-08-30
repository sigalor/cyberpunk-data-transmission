# Cyberpunk data transmission

## Instructions
Please download [this ZIP file](https://drive.google.com/file/d/1ftg0sDJXQM4f_zPYTed210xymgyGOmGx/view) and extract the PNG images into a directory called `full`. As you can see, all of them are FullHD captures of the livestream that was running at [CDPROJEKTRED's Twitch](https://www.twitch.tv/cdprojektred).

After that, run `npm install` and finally `node index.js`. This script will look at all screenshots in order, parse them and eventually write the output to `output.png`. This is the image that arises from it:

![Cyberpunk 2077 screenshot](/output.png)

## Requirements
Node, at least version 8

## How does it work?
This project does not use any machine learning, but just "old" techniques, mainly [PSNR](https://en.wikipedia.org/wiki/Peak_signal-to-noise_ratio). For parsing an image (while each image has to have the dimensions 1920x1080 px), the following steps are executed.

1. Read it in grayscale, i.e. each pixel gets a value between 0 and 255. Additionally, its color is inverted.
2. Crop the image to be 1440x1080 pixels, starting at pixel 269 on the left hand side.
3. Move the image 2 pixels down, filling it with white at the top.
4. As each character needs 20x40 pixels, the image consists of 72 rows and 27 columns. Every character is extracted at put into its own 20x40 pixels buffer.
5. Using PSNR, each character is compared to each image in the `chars` directory. The one that gets the highest score (i.e. the highest degree of similarity/certainty) is accepted to be the solution, i.e. the parsed character. If the average certainty score of a row is less than 30, the entire image is discarded. This may be the case if the screenshot happens to be blurry for some reason.
6. If the entire image has been parsed successfully, the script will try to join its stringified rows with the ones from the previous image. To do that, it tries to find the first row of the current image in the list of previous rows. If no match exists, the current image is invalid and will be discarded. Before trying to match up the rows, the script also makes sure to detect screen tearing, i.e. mostly repeated or unclear lines, which happen frequently due to Twitch's method of transmitting livestreams.
7. After a new image's parsed lines have been appended to the previous lines, the current image data is written to `output.png` and the script continues with the next image. To process each of the more than 3000 images, my machine needed about 30 minutes.

## Legal
This code is in no way affiliated with, authorized, maintained, sponsored or endorsed by CDPROJEKTRED or any of its affiliates or subsidiaries. This is an independent and unofficial software. Use at your own risk.
