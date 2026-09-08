let categories = [];
let businesses = [];


/* =========================================================
   LOAD JSON
   ========================================================= */

async function loadJson() {
  try {
    const catRes = await fetch('./categories.json');

    if (!catRes.ok) {
      throw new Error(
        `Failed to load categories.json: ${catRes.status}`
      );
    }

    categories = await catRes.json();


    const busRes = await fetch('./businesses.json');

    if (!busRes.ok) {
      throw new Error(
        `Failed to load businesses.json: ${busRes.status}`
      );
    }

    businesses = await busRes.json();

  } catch (error) {
    console.error('Error loading JSON:', error);
  }
}


/* =========================================================
   LANDING CATEGORIES
   ========================================================= */

function renderLandingCategories() {

  const wrap =
    document.getElementById('landingCatContainer');

  if (!wrap) {
    console.error(
      'landingCatContainer not found'
    );
    return;
  }

  wrap.innerHTML = '';


  categories.forEach(cat => {

    const groupDiv =
      document.createElement('div');

    groupDiv.className = 'cat-group';


    groupDiv.innerHTML = `
      <div class="cat-parent flex justify-between items-center cursor-pointer">
        <span>
          ${cat.icon || ''} ${cat.name}
        </span>

        <i class="fa fa-chevron-down cat-arrow"></i>
      </div>

      <div class="cat-children hidden">

        ${(cat.sub || []).map(sub => `
          <div
            class="subcat-item"
            data-cat="${cat.name}"
            data-subid="${sub.id}"
          >
            ${sub.name}
          </div>
        `).join('')}

      </div>
    `;


    wrap.appendChild(groupDiv);
  });


  /* Expand / collapse category */

  document
    .querySelectorAll('.cat-parent')
    .forEach(parent => {

      parent.addEventListener(
        'click',
        () => {

          const children =
            parent.nextElementSibling;

          const arrow =
            parent.querySelector('.cat-arrow');


          if (!children) {
            return;
          }


          children.classList.toggle(
            'hidden'
          );


          if (arrow) {
            arrow.classList.toggle(
              'rotate-180'
            );
          }

        }
      );

    });


  /* Subcategory click */

  document
    .querySelectorAll('.subcat-item')
    .forEach(sub => {

      sub.addEventListener(
        'click',
        event => {

          event.stopPropagation();

          const catName =
            sub.dataset.cat;

          showList(catName);

        }
      );

    });

}


/* =========================================================
   DRAWER CATEGORIES
   ========================================================= */

function renderDrawerCategories() {

  const wrap =
    document.getElementById(
      'drawerCatContainer'
    );

  if (!wrap) {
    console.error(
      'drawerCatContainer not found'
    );
    return;
  }


  wrap.innerHTML = `
    <div
      class="px-4 py-3 border-b text-sm cursor-pointer hover:bg-gray-100 drawer-category"
      data-cat="全部"
    >
      全部商家
    </div>
  `;


  categories.forEach(cat => {

    const div =
      document.createElement('div');

    div.className =
      'px-4 py-3 border-b text-sm cursor-pointer hover:bg-gray-100 drawer-category';

    div.innerText =
      cat.name;

    div.dataset.cat =
      cat.name;

    wrap.appendChild(div);

  });


  document
    .querySelectorAll('.drawer-category')
    .forEach(item => {

      item.addEventListener(
        'click',
        () => {

          const category =
            item.dataset.cat ||
            item.innerText;

          closeDrawerFunc();

          showList(category);

        }
      );

    });

}


/* =========================================================
   BUSINESS LIST
   ========================================================= */

function renderBusinessList(categoryName) {

  const wrap =
    document.getElementById(
      'businessListWrap'
    );

  if (!wrap) {
    console.error(
      'businessListWrap not found'
    );
    return;
  }


  let list;


  if (
    !categoryName ||
    categoryName === '全部'
  ) {

    list = businesses;

  } else {

    list =
      businesses.filter(
        b => b.catName === categoryName
      );

  }


  /* No results */

  if (list.length === 0) {

    wrap.innerHTML = `
      <div class="empty-result">

        <i
          class="fa fa-search text-2xl mb-3 text-gray-300"
        ></i>

        <div>
          暂无本分类商家
        </div>

      </div>
    `;

    return;
  }


  /* Business cards */

  wrap.innerHTML =
    list.map(b => `

      <div class="business-card">

        <div
          class="flex justify-between items-start gap-3"
        >

          <h3 class="business-name">
            ${b.name || ''}
          </h3>

          <span class="business-category">
            ${b.catName || ''}
          </span>

        </div>


        ${
          b.desc
            ? `
              <p class="business-desc">
                ${b.desc}
              </p>
            `
            : ''
        }


        <div class="business-info">

          ${
            b.phone
              ? `
                <div>

                  <i class="fa fa-phone"></i>

                  <a
                    href="tel:${b.phone}"
                    class="business-phone"
                  >
                    ${b.phone}
                  </a>

                </div>
              `
              : ''
          }


          ${
            b.address
              ? `
                <div>

                  <i class="fa fa-map-marker"></i>

                  <span>
                    ${b.address}
                  </span>

                </div>
              `
              : ''
          }

        </div>

      </div>

    `).join('');
}


/* =========================================================
   VIEW SWITCHING
   ========================================================= */

const landingView =
  document.getElementById(
    'landingView'
  );

const listView =
  document.getElementById(
    'listView'
  );

const listPageTitle =
  document.getElementById(
    'listPageTitle'
  );

const backLandingBtn =
  document.getElementById(
    'backLandingBtn'
  );


function showLanding() {

  if (!landingView || !listView) {
    return;
  }


  landingView.classList.remove(
    'view-hidden'
  );

  listView.classList.add(
    'view-hidden'
  );

}


function showList(
  categoryName = '全部'
) {

  if (!landingView || !listView) {
    return;
  }


  landingView.classList.add(
    'view-hidden'
  );

  listView.classList.remove(
    'view-hidden'
  );


  if (listPageTitle) {

    listPageTitle.innerText =
      categoryName === '全部'
        ? '全部商家'
        : categoryName;

  }


  renderBusinessList(
    categoryName
  );


  /* Always make sure the drawer is closed */

  closeDrawerFunc();
}


if (backLandingBtn) {

  backLandingBtn.addEventListener(
    'click',
    showLanding
  );

}


/* =========================================================
   DRAWER
   ========================================================= */

const naviBtn =
  document.getElementById(
    'naviBtn'
  );

const drawerOverlay =
  document.getElementById(
    'drawerOverlay'
  );

const drawerPanel =
  document.getElementById(
    'drawerPanel'
  );

const closeDrawer =
  document.getElementById(
    'closeDrawer'
  );


function openDrawer() {

  if (!drawerOverlay || !drawerPanel) {
    return;
  }


  drawerOverlay.classList.remove(
    'hidden'
  );

  drawerPanel.classList.add(
    'open'
  );

}


function closeDrawerFunc() {

  if (!drawerOverlay || !drawerPanel) {
    return;
  }


  drawerOverlay.classList.add(
    'hidden'
  );

  drawerPanel.classList.remove(
    'open'
  );

}


if (naviBtn) {

  naviBtn.addEventListener(
    'click',
    openDrawer
  );

}


if (closeDrawer) {

  closeDrawer.addEventListener(
    'click',
    closeDrawerFunc
  );

}


if (drawerOverlay) {

  drawerOverlay.addEventListener(
    'click',
    closeDrawerFunc
  );

}


/* =========================================================
   SEARCH
   ========================================================= */

const searchInput =
  document.getElementById(
    'searchInput'
  );


if (searchInput) {

  searchInput.addEventListener(
    'input',
    event => {

      const kw =
        event.target.value
          .trim()
          .toLowerCase();

      console.log(
        '搜索关键词:',
        kw
      );

    }
  );

}


/* =========================================================
   INITIALIZE
   ========================================================= */

(async function init() {

  await loadJson();

  renderLandingCategories();

  renderDrawerCategories();

})();