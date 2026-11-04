
let categories = [];
let businesses = [];
let activeCategoryName = null;
let activeSubCategoryName = null;


/* =========================================================
   LOAD JSON
   ========================================================= */

async function loadJson() {
  try {

    /* Load categories */

    const catRes = await fetch('./categories.json',{ cache: 'no-cache' });

    if (!catRes.ok) {
      throw new Error(
        `Failed to load categories.json: ${catRes.status}`
      );
    }

    categories = await catRes.json();


    /* Load businesses */

    const busRes = await fetch('./businesses.json',{ cache: 'no-cache' });

    if (!busRes.ok) {
      throw new Error(
        `Failed to load businesses.json: ${busRes.status}`
      );
    }

    businesses = await busRes.json();

  } catch (error) {

    console.error(
      'Error loading JSON:',
      error
    );

  }
}


/* =========================================================
   LANDING CATEGORIES
   ========================================================= */

function renderLandingCategories() {

  const wrap =
    document.getElementById(
      'landingCatContainer'
    );

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

    groupDiv.className =
      'cat-group';


    groupDiv.innerHTML = `

      <div
        class="cat-parent flex justify-between items-center cursor-pointer"
      >

        <span>
          ${cat.icon || ''}
          ${cat.name}
        </span>

        <i
          class="fa fa-chevron-down cat-arrow"
        ></i>

      </div>


      <div class="cat-children hidden">

        ${(cat.sub || []).map(sub => `

          <div
            class="subcat-item"
            data-cat="${cat.name}"
            data-subcat="${sub.name}"
          >
            ${sub.name}
          </div>

        `).join('')}

      </div>

    `;


    wrap.appendChild(groupDiv);

  });


  /* =====================================================
     PARENT CATEGORY EXPAND / COLLAPSE
     ===================================================== */

  document
    .querySelectorAll('.cat-parent')
    .forEach(parent => {

      parent.addEventListener(
        'click',
        () => {

          const children =
            parent.nextElementSibling;

          const arrow =
            parent.querySelector(
              '.cat-arrow'
            );


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


  /* =====================================================
     SUBCATEGORY CLICK
     ===================================================== */

  document
    .querySelectorAll('.subcat-item')
    .forEach(sub => {

      sub.addEventListener(
        'click',
        event => {

          event.stopPropagation();


          const categoryName =
            sub.dataset.cat;

          const subCategoryName =
            sub.dataset.subcat;


          if (
            !categoryName ||
            !subCategoryName
          ) {

            console.error(
              'Category or subcategory name not found:',
              categoryName,
              subCategoryName
            );

            return;
          }


          /*
           * Show only the selected
           * subcategory.
           */

          showList(
            categoryName,
            subCategoryName
          );

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


  wrap.innerHTML = '';


  categories.forEach(cat => {

    const div =
      document.createElement('div');


    div.className =
      'px-4 py-3 border-b text-sm cursor-pointer hover:bg-gray-100 drawer-category';


    div.innerText =
      cat.name;


    /*
     * No category ID is needed.
     * Store the category name directly.
     */

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

          const categoryName =
            item.dataset.cat;


          if (!categoryName) {

            console.error(
              'Category name not found'
            );

            return;
          }


          closeDrawerFunc();


          /*
           * Parent category:
           * show all businesses under
           * this category.
           */

          showList(
            categoryName
          );

        }
      );

    });

}


/* =========================================================
   BUSINESS LIST
   ========================================================= */

function renderBusinessList(
  categoryName,
  subCategoryName = null,
  searchTerm = ''
) {

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


  /* =====================================================
     SUBCATEGORY FILTER
     ===================================================== */

  const normalizedSearchTerm =
    String(searchTerm).trim().toLocaleLowerCase();

  if (normalizedSearchTerm) {

    list = businesses;

  }

  else if (subCategoryName) {

    list =
      businesses.filter(
        b =>
          b.catName === categoryName &&
          b.subCatName === subCategoryName
      );

  }


  /* =====================================================
     PARENT CATEGORY FILTER
     ===================================================== */

  else if (categoryName) {

    list =
      businesses.filter(
        b =>
          b.catName === categoryName
      );

  }


  /* =====================================================
     ALL BUSINESSES
     ===================================================== */

  else {

    list =
      businesses;

  }

  if (normalizedSearchTerm) {

    list = list.filter(b => {

      const businessName =
        String(b.business_name || '').toLocaleLowerCase();

      const description =
        String(b.desc || '').toLocaleLowerCase();

      return businessName.includes(normalizedSearchTerm) ||
        description.includes(normalizedSearchTerm);

    });

  }


  /* =====================================================
     NO RESULTS
     ===================================================== */

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


  /* =====================================================
     BUSINESS CARDS
     ===================================================== */

  wrap.innerHTML =

    list.map(
      b => `

        <div class="business-card">

          <!-- Business name / category -->

          <div
            class="flex justify-between items-start gap-3"
          >

            <h3 class="business-name">
              ${b.business_name || ''}
            </h3>

            <span class="business-category">
              ${b.subCatName || b.catName || ''}
            </span>

          </div>


          <!-- Description -->

          ${
            b.desc
              ? `
                <p class="business-desc">
                  ${formatDescription(b.desc)}
                </p>
              `
              : ''
          }


          <!-- Business information -->

          <div class="business-info">


            <!-- Phone -->

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


            <!-- WeChat -->

            ${
              b.wechat
                ? `
                  <div>

                    <i class="fa fa-weixin"></i>

                    <span>
                      ${b.wechat}
                    </span>

                  </div>
                `
                : ''
            }


            <!-- Email -->

            ${
              b.Email
                ? `
                  <div>

                    <i class="fa fa-envelope"></i>

                    <a
                      href="mailto:${b.Email}"
                    >
                      ${b.Email}
                    </a>

                  </div>
                `
                : ''
            }


            <!-- Address -->

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


            <!-- Website -->

            ${
              b.url
                ? `
                  <div>

                    <i class="fa fa-globe"></i>

                    <a
                      href="${normalizeUrl(b.url)}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ${b.url}
                    </a>

                  </div>
                `
                : ''
            }


          </div>

        </div>

      `
    ).join('');

}


/* =========================================================
   DESCRIPTION FORMATTING
   ========================================================= */

/*
 * Preserve line breaks in the Excel description.
 */

function formatDescription(text) {

  return String(text)
    .replace(/\n/g, '<br>');

}


/* =========================================================
   URL NORMALIZATION
   ========================================================= */

/*
 * If Excel contains:
 *
 * www.example.com
 *
 * convert it to:
 *
 * https://www.example.com
 */

function normalizeUrl(url) {

  const value =
    String(url).trim();


  if (
    value.startsWith('http://') ||
    value.startsWith('https://')
  ) {

    return value;

  }


  return `https://${value}`;

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


/* =========================================================
   SHOW LANDING
   ========================================================= */

function showLanding() {

  if (
    !landingView ||
    !listView
  ) {

    return;

  }


  landingView.classList.remove(
    'view-hidden'
  );


  listView.classList.add(
    'view-hidden'
  );

}


/* =========================================================
   SHOW BUSINESS LIST
   ========================================================= */

/*
 * categoryName:
 *   Parent category name
 *
 * subCategoryName:
 *   Optional subcategory name
 *
 * Examples:
 *
 * showList("医疗保健")
 *
 * showList("医疗保健", "针灸推拿")
 */

function showList(
  categoryName = null,
  subCategoryName = null
) {

  if (
    !landingView ||
    !listView
  ) {

    return;

  }


  /* Switch views */

  landingView.classList.add(
    'view-hidden'
  );


  listView.classList.remove(
    'view-hidden'
  );

  activeCategoryName = categoryName;
  activeSubCategoryName = subCategoryName;


  /* =====================================================
     PAGE TITLE
     ===================================================== */

  if (listPageTitle) {

    if (subCategoryName) {

      listPageTitle.innerText =
        subCategoryName;

    }

    else if (categoryName) {

      listPageTitle.innerText =
        categoryName;

    }

    else {

      listPageTitle.innerText =
        '全部商家';

    }

  }


  /* =====================================================
     RENDER
     ===================================================== */

  renderBusinessList(
    categoryName,
    subCategoryName,
    document.querySelector('.listing-search-input')?.value || ''
  );


  /* Always close drawer */

  closeDrawerFunc();

}


/* =========================================================
   BACK BUTTON
   ========================================================= */

const searchInputs =
  document.querySelectorAll(
    '.listing-search-input'
  );

searchInputs.forEach(input => {

  input.addEventListener(
    'input',
    () => {

      searchInputs.forEach(otherInput => {

        if (otherInput !== input) {
          otherInput.value = input.value;
        }

      });

      const searchTerm = input.value.trim();

      if (searchTerm && !landingView.classList.contains('view-hidden')) {
        showList();
      }

      else {
        renderBusinessList(
          activeCategoryName,
          activeSubCategoryName,
          searchTerm
        );
      }

    }
  );

});

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


/* =========================================================
   OPEN DRAWER
   ========================================================= */

function openDrawer() {

  if (
    !drawerOverlay ||
    !drawerPanel
  ) {

    return;

  }


  drawerOverlay.classList.remove(
    'hidden'
  );


  drawerPanel.classList.add(
    'open'
  );

}


/* =========================================================
   CLOSE DRAWER
   ========================================================= */

function closeDrawerFunc() {

  if (
    !drawerOverlay ||
    !drawerPanel
  ) {

    return;

  }


  drawerOverlay.classList.add(
    'hidden'
  );


  drawerPanel.classList.remove(
    'open'
  );

}


/* Navigation button */

if (naviBtn) {

  naviBtn.addEventListener(
    'click',
    openDrawer
  );

}


/* Close button */

if (closeDrawer) {

  closeDrawer.addEventListener(
    'click',
    closeDrawerFunc
  );

}


/* Overlay */

if (drawerOverlay) {

  drawerOverlay.addEventListener(
    'click',
    closeDrawerFunc
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

