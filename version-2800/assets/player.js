import { H as Hls } from './hls.js';

const players = document.querySelectorAll('[data-player]');

players.forEach((player) => {
  const video = player.querySelector('video');
  const button = player.querySelector('.player-overlay');
  const status = player.querySelector('.player-status');
  const source = player.dataset.stream;
  let ready = false;
  let hls = null;

  const setStatus = (message) => {
    if (status) {
      status.textContent = message;
    }
  };

  const prepare = () => {
    if (ready || !video || !source) {
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        ready = true;
        setStatus('准备就绪');
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data?.fatal) {
          setStatus('播放出错，请稍后再试');
          hls.destroy();
          hls = null;
          ready = false;
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      ready = true;
      setStatus('准备就绪');
    } else {
      setStatus('播放出错，请稍后再试');
    }
  };

  const play = async () => {
    prepare();
    if (!video) {
      return;
    }
    try {
      setStatus('加载中');
      await video.play();
      button?.classList.add('is-hidden');
      setStatus('播放中');
    } catch (error) {
      setStatus('点击播放');
    }
  };

  button?.addEventListener('click', play);
  video?.addEventListener('click', () => {
    if (video.paused) {
      play();
    }
  });
  video?.addEventListener('play', () => {
    button?.classList.add('is-hidden');
    setStatus('播放中');
  });
  video?.addEventListener('pause', () => {
    setStatus('已暂停');
  });
});
