sudo apt-get update &&
sudo apt-get install build-essential automake &&
pushd /tmp &&
git clone https://github.com/facebook/watchman.git &&
cd watchman &&
git checkout v4.7.0  # the latest stable release &&
./autogen.sh &&
./configure &&
make &&
sudo make install &&
popd
