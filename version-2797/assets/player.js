(function () {
    function setupMoviePlayer(playerId, streamUrl) {
        var player = document.getElementById(playerId);
        if (!player || !streamUrl) {
            return;
        }
        var video = player.querySelector("video");
        var layer = player.querySelector("[data-play-layer]");
        var hlsInstance = null;
        var isBound = false;

        function playVideo() {
            player.classList.add("is-playing");
            if (video) {
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }
        }

        function bindStream() {
            if (!video || isBound) {
                playVideo();
                return;
            }
            isBound = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                return;
            }
            video.src = streamUrl;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            playVideo();
        }

        if (layer) {
            layer.addEventListener("click", bindStream);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    bindStream();
                }
            });
        }
        player.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                bindStream();
            }
        });
        player.cleanupPlayer = function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        };
    }

    window.setupMoviePlayer = setupMoviePlayer;
})();
