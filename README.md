# Cyberpunk data transmission

## Instructions
Please download some images from [this Google Drive](https://photos.google.com/share/AF1QipOg6ByRA_jkfgL8cmtKiF3L1tQ-oETifnt71Sc-xY80YKLUNJrFPXVXg-wzWDhFqQ?key=SWhVRXhMX1h0LWdmSkZxVmU4VFlQeFoxdjUybHFn), created by an amazing fellow Reddit user. As you can see, all of them are FullHD captures of the livestream currently running at [CDPROJEKTRED's Twitch](https://www.twitch.tv/cdprojektred).

When you have an image, just pass its name to `parse-image.sh` as the first command line parameter.

This utility first crops and color-corrects the original image, then it scans through the image character by character and tries to parse it by comparing it to the ones in the `chars` directory.

During my exiperiments, I got 100% accuracy.

## Requirements
Linux, BASH, ImageMagick



## Participate
To participate, please first submit a pull request which appends your name and the original PNG file you want to parse to the list below. Then, parse this PNG file, add the result to the `res` subdirectory, and finally submit a pull request for it. To stay consistent, I propose a naming scheme that follows the one from the Google Drive, i.e. if the file you downloaded is named `cp37500.png`, please call your submitted file `cp37500.txt`.

After enough result files have been assembled, further effort can be made to correctly concatenate all of them.

## Currently active parsing processes
