function initMoviePlayer(playUrl) {
    var video = document.getElementById('movie-video');
    var wrap = document.getElementById('movie-player-wrap');
    var button = document.getElementById('movie-play-button');
    var hlsInstance = null;

    if (!video || !playUrl) {
        return;
    }

    function attachStream() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== playUrl) {
                video.src = playUrl;
            }
            return Promise.resolve();
        }

        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            if (!hlsInstance) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(playUrl);
                hlsInstance.attachMedia(video);
            }
            return Promise.resolve();
        }

        video.src = playUrl;
        return Promise.resolve();
    }

    function startPlayback() {
        attachStream().then(function () {
            var promise = video.play();
            if (promise && typeof promise.then === 'function') {
                promise.then(function () {
                    if (wrap) {
                        wrap.classList.add('playing');
                    }
                }).catch(function () {
                    if (wrap) {
                        wrap.classList.remove('playing');
                    }
                });
            } else if (wrap) {
                wrap.classList.add('playing');
            }
        });
    }

    if (button) {
        button.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', function () {
        if (wrap) {
            wrap.classList.add('playing');
        }
    });

    video.addEventListener('pause', function () {
        if (wrap) {
            wrap.classList.remove('playing');
        }
    });

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });
}
