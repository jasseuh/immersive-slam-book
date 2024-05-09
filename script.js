let saved = localStorage.getItem('saved') || false;
let editMode = true;

const form = document.forms['slam-book'];

// helper functions

const clamp = (min, num, max) => Math.max(min, Math.min(num, max));

const delay = ms => new Promise((res, rej) => setTimeout(res, ms || 1000));

const random = (num, min = 0, round = true) => {
  const r = (Math.random() * (num - min)) + min;

  if (round) return Math.round(r);
  else return r;
};

// initialize book data

const leaves = document.getElementsByClassName('leaf');
const pages = document.getElementsByClassName('page');
const bookmarks = document.getElementsByClassName('bookmark');

for (let i = 0; i < leaves.length; i++) {
  leaves[i].style.zIndex = leaves.length - i;
  leaves[i].dataset.index = i;
}

for (let i = 0; i < pages.length; i++) {
  pages[i].style.zIndex = pages.length - i;
  pages[i].dataset.index = i;

  if (pages[i].id == 'front' ||
      pages[i].id == 'back' ||
      pages[i].classList.contains('blank')) continue;

  const pageNum = document.createElement('span');
  const pageNumNum = document.createElement('span');
  pageNumNum.textContent = i;
  pageNum.appendChild(pageNumNum);
  pageNum.style.display = 'grid';
  pageNum.style.placeItems = 'center';
  pageNum.style.position = 'absolute';
  pageNum.style.bottom = 0;
  i % 2 == 0
      ? pageNum.style.right = 0
      : pageNum.style.left = 0;
  pageNum.style.width = '32px';
  pageNum.style.height = '32px';
  pageNum.style.margin = '8px';
  pageNum.style.color = '#222';
  pageNum.style.fontSize = '150%';
  pages[i].appendChild(pageNum);
}

for (let i = 0; i < bookmarks.length; i++) {
  bookmarks[i].onclick = e => goTo(e.srcElement);
  bookmarks[i].style.backgroundColor = `hsl(${random(360)}, 50%, 50%)`;
  
  if (bookmarks[i].parentElement.dataset.index % 2 == 0) {
    bookmarks[i].style.left = `${24 * i + 32}px`;
  } else {
    bookmarks[i].style.right = `${24 * i + 32}px`;
  }
}

// navigation

async function first() {
  const index = parseInt(document.querySelector('.leaf.current').dataset.index);
  
  for (let i = index; i >= 0; i--) {
    previous();
    await delay(200);
  }
}

async function last() {
  const index = parseInt(document.querySelector('.leaf.current').dataset.index);
  
  for (let i = index; i < leaves.length; i++) {
    next();
    await delay(200);
  }
}

async function previous() {
  const i = parseInt(document.querySelector('.leaf.current').dataset.index);
  
  if (!leaves[i - 1]) return;
  
  leaves[i].classList.remove('current');
  leaves[i - 1].classList.remove('turned');
  leaves[i - 1].classList.add('current');
  
  await delay(200);
  
  leaves[i - 1].style.zIndex *= -1;
  leaves[i - 1].children[0].style.zIndex *= -1;
  leaves[i - 1].children[1].style.zIndex *= -1;
}

async function next() {
  const i = parseInt(document.querySelector('.leaf.current').dataset.index);
  
  if (!leaves[i + 1]) return;
  
  leaves[i].classList.remove('current');
  leaves[i].classList.add('turned');
  leaves[i + 1].classList.add('current');
  
  await delay(200);
  
  leaves[i].style.zIndex *= -1;
  leaves[i].children[0].style.zIndex *= -1;
  leaves[i].children[1].style.zIndex *= -1;
}

// clear and close

async function clearAll() {
  form.reset();
  document.getElementById('pp-image').src = './man.svg';
  await first();
}

// skip to page

async function goTo(el) {
  const target = parseInt(el.parentElement.parentElement.dataset.index);
  const page = parseInt(el.parentElement.dataset.index);
  const current = parseInt(document.querySelector('.leaf.current')
      .dataset.index);

  if (page % 2 == 1) next();

  if (target > current) {
    for (let i = current; i < target; i++) {
      next();
      await delay(200);
    }
  } else if (target < current) {
    for (let i = current; i > target; i--) {
      previous();
      await delay(200);
    }
  }
}

// profile picture

const getPP = () =>
  document.getElementById('file-choose').click();

function setPP(el) {
  if (FileReader && el.files && el.files.length) {
    const fr = new FileReader();
    fr.onload = () =>
        document.getElementById('pp-image').src = fr.result;
    fr.readAsDataURL(el.files[0]);
  }
}

// secret

form['fun-facts-reveal'].onchange = e => {
  if (e.target.checked) {
    form['crush'].type = 'text';
    form['love'].type = 'text';
    form['meet'].type = 'text';
    form['kiss'].type = 'text';
  } else {
    form['crush'].type = 'password';
    form['love'].type = 'password';
    form['meet'].type = 'password';
    form['kiss'].type = 'password';
  }
}

// save & load

const keys = [
  'pp-image',

  'name',
  'age',
  'gender',
  'gender-specify',
  'address',
  'email',
  'language',
  'course',
  'bio',

  'color',
  'drink',
  'food',
  'pet',
  'number',
  'band',
  'song',
  'quote',

  'status',
  'status-specify',
  'crush',
  'love',
  'meet',
  'kiss',

  'unforgettable',
  'embarassing',
  'funniest',
];

const save = () => form['submit'].click();
const edit = () => location.href = './edit.html';

form.onsubmit = e => {
  e.preventDefault();
  keys.forEach(key =>
      localStorage.setItem(key, form[key].value || form[key].src || '') );
  window.alert('Saved!');
  location.href = './view.html';
};

const load = () => {
  keys.forEach(key => {
    if (form[key]['name'] == 'pp-image')
        form[key].src = localStorage.getItem(key) || './man.svg'; 
    else {
      form[key].value = localStorage.getItem(key) || '';
      if (form[key].value == 'other')
          form[`${key}-specify`].value = 
              localStorage.getItem(`${key}-specify`) || '';
    }
  });
};

window.onload = () => load();

function printSaved() {
  keys.forEach(key => console.log(key, localStorage.getItem(key)));
}

twemoji.parse(document.body, {
  // base: './twemoji/assets/',
  folder: 'svg',
  ext: '.svg'
});
