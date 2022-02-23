(function () {
  const modal = document.getElementById("modal");
  const content = document.getElementById("content");
  const video = document.getElementById("video");
  const video_prev = document.getElementById("video-prev");
  const video_next = document.getElementById("video-next");
  const image = document.getElementById("img");
  const image_prev = document.getElementById("img-prev");
  const image_next = document.getElementById("img-next");
  let star = null,
    lazyVideoObserver = null;
  if ("IntersectionObserver" in window) {
    lazyVideoObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (video) {
        if (video.isIntersecting) {
          video.target.firstChild.src = video.target.dataset.src;
          video.target.load();
          video.target.play();
          lazyVideoObserver.unobserve(video.target);
        }
      });
    });
  }

  function closeModal() {
    modal.style.display = "none";
    if (lazyVideoObserver) {
      lazyVideoObserver.disconnect();
    }
  }

  modal.addEventListener("click", closeModal);
  modal.addEventListener(
    "wheel",
    function (e) {
      e.preventDefault();
      if (matchMedia("(orientation:landscape)").matches) {
        modal.scrollLeft += e.deltaY + e.deltaX;
      } else {
        modal.scrollTop += e.deltaY + e.deltaX;
      }
    },
    { passive: false }
  );

  function createModalEle(ele) {
    const src = ele.dataset.modal || ele.src;
    let node;
    if (src.endsWith("mp4")) {
      node = document.createElement("video");
      node.autoplay = true;
      node.loop = true;
      node.muted = true;
      node.playsinline = true;
      node.poster = ele.src;
      source = document.createElement("source");
      source.type = "video/mp4";
      node.appendChild(source);
      if (lazyVideoObserver) {
        node.dataset.src = src;
        lazyVideoObserver.observe(node);
      } else {
        source.src = src;
      }
    } else {
      node = document.createElement("img");
      node.src = src;
    }
    node.addEventListener("click", function (e) {
      e.stopPropagation();
      const modalLeft = modal.scrollLeft,
        modalTop = modal.scrollTop;
      centerOn(this, "smooth");
      setTimeout(function () {
        if (modal.scrollLeft == modalLeft && modal.scrollTop == modalTop) {
          closeModal();
        }
      }, 33);
    });
    return node;
  }

  function setStar(newstar) {
    star = newstar;
    let scrollto = null;
    while (modal.firstChild) {
      modal.removeChild(modal.firstChild);
    }
    modal.appendChild(document.createElement("div"));
    for (const image of content.children) {
      const node = createModalEle(image);
      modal.appendChild(node);
      if (image === star) {
        scrollto = node;
      }
    }
    modal.appendChild(document.createElement("div"));
    modal.style.display = "flex";
    if (scrollto) {
      centerOn(scrollto);
      if (scrollto.tagName === "VIDEO") {
        scrollto.addEventListener("loadeddata", function () {
          centerOn(this);
        });
      } else {
        setTimeout(function () {
          centerOn(scrollto);
        }, 1);
      }
    }
  }

  function centerOn(ele, behavior = "instant") {
    modal.scroll({
      left:
        ele.offsetLeft - document.body.offsetWidth / 2 + ele.offsetWidth / 2,
      top:
        ele.offsetTop - document.body.offsetHeight / 2 + ele.offsetHeight / 2,
      behavior: behavior,
    });
  }

  for (const image of content.children) {
    image.addEventListener("click", function () {
      setStar(this);
    });
  }
})();