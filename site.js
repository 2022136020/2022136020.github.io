(function () {
  var root = document.documentElement;
  try { var t = localStorage.getItem('theme'); if (t) root.setAttribute('data-theme', t); } catch (e) {}
  var themeBtn = document.getElementById('theme');
  function dark() { var t = root.getAttribute('data-theme'); return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }
  function paint() { themeBtn.textContent = dark() ? '☀' : '☾'; }
  themeBtn.onclick = function () { var n = dark() ? 'light' : 'dark'; root.setAttribute('data-theme', n); try { localStorage.setItem('theme', n); } catch (e) {} paint(); };
  paint();

  // 라이트박스
  var lb = document.getElementById('lb'), lbImg = lb.querySelector('img');
  lb.onclick = function () { lb.close(); };
  function zoom(src) { lbImg.src = src; if (lb.showModal) lb.showModal(); }

  // 스크린샷 뷰어
  document.querySelectorAll('.viewer').forEach(function (v) {
    var shots = JSON.parse(v.getAttribute('data-shots'));
    v.innerHTML = '<div class="stage"><img class="layer on" alt=""><img class="layer" alt="">' +
      '<button type="button" class="arrow prev" aria-label="이전 이미지">&#8249;</button>' +
      '<button type="button" class="arrow next" aria-label="다음 이미지">&#8250;</button></div>' +
      '<p class="cap"></p><div class="thumbs"></div>';
    var stage = v.querySelector('.stage'), layers = stage.querySelectorAll('.layer'), cap = v.querySelector('.cap'), th = v.querySelector('.thumbs');
    var cur = 0, timer = null, paused = false, front = 0, first = true;
    // 두 장을 겹쳐 두고 뒤쪽 장에 새 이미지를 불러온 뒤 서서히 교차시킴
    function show(i) {
      cur = (i + shots.length) % shots.length;
      cap.classList.add('fade');
      th.querySelectorAll('button').forEach(function (b, j) { b.classList.toggle('on', cur === j); });
      var src = shots[cur][0], text = shots[cur][1];
      if (first) { layers[0].src = src; layers[0].alt = text; cap.textContent = text; cap.classList.remove('fade'); first = false; return; }
      var back = layers[1 - front], want = cur, done = false;
      back.onload = function () {
        if (done || want !== cur) return;
        done = true; back.onload = null;
        back.classList.add('on'); layers[front].classList.remove('on'); front = 1 - front;
        cap.textContent = text; cap.classList.remove('fade');
      };
      back.alt = text; back.src = src;
      if (back.complete && back.naturalWidth) back.onload();
    }
    // 5초마다 다음 이미지로 (직접 넘기면 타이머 다시 시작)
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        if (!paused && !lb.open && v.offsetParent !== null) show(cur + 1);
      }, 5000);
    }
    function go(i) { show(i); restart(); }
    shots.forEach(function (s, i) {
      var b = document.createElement('button'); b.type = 'button'; b.title = s[1];
      b.innerHTML = '<img loading="lazy" alt="" src="' + s[0] + '">';
      b.onclick = function () { go(i); };
      th.appendChild(b);
    });
    stage.querySelector('.prev').onclick = function (e) { e.stopPropagation(); go(cur - 1); };
    stage.querySelector('.next').onclick = function (e) { e.stopPropagation(); go(cur + 1); };
    stage.onclick = function () { zoom(layers[front].src); };
    stage.onmouseenter = function () { paused = true; };
    stage.onmouseleave = function () { paused = false; };
    show(0); restart();
  });

  // 프로젝트 안 탭
  document.querySelectorAll('.story').forEach(function (st) {
    var tabs = st.querySelector('.tabs'), panels = st.querySelectorAll('.panel');
    panels.forEach(function (p, i) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = p.getAttribute('data-tab');
      b.onclick = function () {
        panels.forEach(function (q, j) { q.classList.toggle('on', i === j); });
        tabs.querySelectorAll('button').forEach(function (x, j) { x.classList.toggle('on', i === j); });
      };
      tabs.appendChild(b);
      if (i === 0) b.click();
    });
  });

  // 설명 박스 최소 높이를 옆 이미지 박스 높이에 맞춤 (두 칸으로 나란히 있을 때만)
  document.querySelectorAll('.split').forEach(function (sp) {
    var viewer = sp.querySelector('.viewer'), story = sp.querySelector('.story');
    function fit() {
      var side = getComputedStyle(sp).gridTemplateColumns.split(' ').length > 1;
      story.style.minHeight = side && viewer.offsetHeight ? viewer.offsetHeight + 'px' : '';
    }
    if (window.ResizeObserver) new ResizeObserver(fit).observe(viewer);
    window.addEventListener('resize', fit);
    fit();
  });

  // 현재 페이지 메뉴 표시
  var cur = document.body.getAttribute('data-v');
  document.querySelectorAll('.views a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-v') === cur); });
})();
