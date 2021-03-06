var routes = [
  // Index page
  {
    path: '/pages',
    url: './pages/index.html',
    name: 'pages',
    master: true,
  },
  // About page
  {
    path: '/about/',
    componentUrl: './pages/about.html',
    name: 'about',
  },
  // Color Themes
  {
    path: '/color-themes/',
    componentUrl: './pages/color-themes.html',
  },
  // Effects
  {
    path: '/page-transitions/',
    componentUrl: './pages/page-transitions.html',
  },
  {
    path: '/page-transitions/:effect',
    componentUrl: './pages/page-transitions-effect.html',
  },

  // Page Loaders
  {
    path: '/page-loader-template7/:user/:userId/:posts/:postId/',
    templateUrl: './pages/page-loader-template7.html',
    // additional context
    options: {
      context: {
        foo: 'bar',
      },
    },
  },
  {
    path: '/page-loader-component/:user/:userId/:posts/:postId/',
    componentUrl: './pages/page-loader-component.html',
    // additional context
    options: {
      context: {
        foo: 'bar',
      },
    },
  },
  // Right Panel pages
  {
    path: '/panel-right-1/',
    content: '\
      <div class="page no-toolbar">\
        <div class="navbar">\
          <div class="navbar-bg"></div>\
          <div class="navbar-inner sliding">\
            <div class="left">\
              <a href="#" class="link back">\
                <i class="icon icon-back"></i>\
                <span class="if-not-md">返回</span>\
              </a>\
            </div>\
            <div class="title">Panel Page 1</div>\
          </div>\
        </div>\
        <div class="page-content">\
          <div class="block">\
            <p>This is a right panel page 1</p>\
            <p>滚滚长江东逝水，浪花淘尽英雄。是非成败转头空，青山依旧在，几度夕阳红。白发渔樵江渚上，惯看秋月春风。一壶浊酒喜相逢，古今多少事，都付笑谈中。</p>\
          </div>\
        </div>\
      </div>\
    ',
  },
  {
    path: '/panel-right-2/',
    content: '\
      <div class="page no-toolbar">\
        <div class="navbar">\
          <div class="navbar-bg"></div>\
          <div class="navbar-inner sliding">\
            <div class="left">\
              <a href="#" class="link back">\
                <i class="icon icon-back"></i>\
                <span class="if-not-md">返回</span>\
              </a>\
            </div>\
            <div class="title">Panel Page 2</div>\
          </div>\
        </div>\
        <div class="page-content">\
          <div class="block">\
            <p>This is a right panel page 2</p>\
            <p>滚滚长江东逝水，浪花淘尽英雄。是非成败转头空，青山依旧在，几度夕阳红。白发渔樵江渚上，惯看秋月春风。一壶浊酒喜相逢，古今多少事，都付笑谈中。</p>\
          </div>\
        </div>\
      </div>\
    ',
  },

  {
    path: '/framework7-home',
    url: './pages/home.html',
    name: 'framework7-home',
    routes: [
      // Components
      {
        path: '/accordion/',
        url: './pages/accordion.html',
      },
      {
        path: '/action-sheet/',
        componentUrl: './pages/action-sheet.html',
      },
      {
        path: '/appbar/',
        componentUrl: './pages/appbar.html',
      },
      {
        path: '/autocomplete/',
        componentUrl: './pages/autocomplete.html',
      },
      {
        path: '/badge/',
        componentUrl: './pages/badge.html',
      },
      {
        path: '/buttons/',
        componentUrl: './pages/buttons.html',
      },
      {
        path: '/calendar/',
        componentUrl: './pages/calendar.html',
      },
      {
        path: '/calendar-page/',
        componentUrl: './pages/calendar-page.html',
      },
      {
        path: '/cards/',
        url: './pages/cards.html',
      },
      {
        path: '/cards-expandable/',
        url: './pages/cards-expandable.html',
      },
      {
        path: '/checkbox/',
        componentUrl: './pages/checkbox.html',
      },
      {
        path: '/chips/',
        componentUrl: './pages/chips.html',
      },
      {
        path: '/color-picker/',
        componentUrl: './pages/color-picker.html',
      },
      {
        path: '/contacts-list/',
        url: './pages/contacts-list.html',
      },
      {
        path: '/content-block/',
        url: './pages/content-block.html',
      },
      {
        path: '/data-table/',
        componentUrl: './pages/data-table.html',
      },
      {
        path: '/dialog/',
        componentUrl: './pages/dialog.html',
      },
      {
        path: '/elevation/',
        url: './pages/elevation.html',
      },
      {
        path: '/fab/',
        url: './pages/fab.html',
      },
      {
        path: '/fab-morph/',
        url: './pages/fab-morph.html',
      },
      {
        path: '/form-storage/',
        url: './pages/form-storage.html',
      },
      {
        path: '/gauge/',
        componentUrl: './pages/gauge.html',
      },
      {
        path: '/grid/',
        url: './pages/grid.html',
      },
      {
        path: '/icons/',
        componentUrl: './pages/icons.html',
      },
      {
        path: '/images/',
        componentUrl: './pages/images.html',
      },
      {
        path: '/infinite-scroll/',
        componentUrl: './pages/infinite-scroll.html',
      },
      {
        path: '/inputs/',
        componentUrl: './pages/inputs.html',
      },
      {
        path: '/lazy-load/',
        componentUrl: './pages/lazy-load.html',
      },
      {
        path: '/list/',
        url: './pages/list.html',
      },
      {
        path: '/list-index/',
        componentUrl: './pages/list-index.html',
      },
      {
        path: '/login-screen/',
        componentUrl: './pages/login-screen.html',
      },
      {
        path: '/login-screen-page/',
        componentUrl: './pages/login-screen-page.html',
      },
      {
        path: '/passcode/',
        componentUrl: './pages/passcode.html',
      },
      {
        path: '/menu/',
        componentUrl: './pages/menu.html',
      },
      {
        path: '/messages/',
        componentUrl: './pages/messages.html',
      },
      {
        path: '/navbar/',
        url: './pages/navbar.html',
      },
      {
        path: '/navbar-hide-scroll/',
        url: './pages/navbar-hide-scroll.html',
      },
      {
        path: '/notifications/',
        componentUrl: './pages/notifications.html',
      },
      {
        path: '/panel/',
        url: './pages/panel.html',
      },
      {
        path: '/photo-browser/',
        componentUrl: './pages/photo-browser.html',
      },
      {
        path: '/picker/',
        componentUrl: './pages/picker.html',
      },
      {
        path: '/popup/',
        componentUrl: './pages/popup.html',
      },
      {
        path: '/popover/',
        url: './pages/popover.html',
      },
      {
        path: '/preloader/',
        componentUrl: './pages/preloader.html',
      },
      {
        path: '/progressbar/',
        componentUrl: './pages/progressbar.html',
      },
      {
        path: '/pull-to-refresh/',
        componentUrl: './pages/pull-to-refresh.html',
      },
      {
        path: '/radio/',
        url: './pages/radio.html',
      },
      {
        path: '/range/',
        componentUrl: './pages/range.html',
      },
      {
        path: '/searchbar/',
        url: './pages/searchbar.html',
      },
      {
        path: '/searchbar-expandable/',
        url: './pages/searchbar-expandable.html',
      },
      {
        path: '/sheet-modal/',
        componentUrl: './pages/sheet-modal.html',
      },
      {
        path: '/skeleton/',
        componentUrl: './pages/skeleton.html',
      },
      {
        path: '/smart-select/',
        url: './pages/smart-select.html',
      },
      {
        path: '/sortable/',
        url: './pages/sortable.html',
      },
      {
        path: '/stepper/',
        componentUrl: './pages/stepper.html',
      },
      {
        path: '/subnavbar/',
        url: './pages/subnavbar.html',
      },
      {
        path: '/subnavbar-title/',
        url: './pages/subnavbar-title.html',
      },
      {
        path: '/swiper/',
        url: './pages/swiper.html',
        routes: [
          {
            path: 'swiper-horizontal/',
            url: './pages/swiper-horizontal.html',
          },
          {
            path: 'swiper-vertical/',
            url: './pages/swiper-vertical.html',
          },
          {
            path: 'swiper-space-between/',
            url: './pages/swiper-space-between.html',
          },
          {
            path: 'swiper-multiple/',
            url: './pages/swiper-multiple.html',
          },
          {
            path: 'swiper-nested/',
            url: './pages/swiper-nested.html',
          },
          {
            path: 'swiper-loop/',
            url: './pages/swiper-loop.html',
          },
          {
            path: 'swiper-3d-cube/',
            url: './pages/swiper-3d-cube.html',
          },
          {
            path: 'swiper-3d-coverflow/',
            url: './pages/swiper-3d-coverflow.html',
          },
          {
            path: 'swiper-3d-flip/',
            url: './pages/swiper-3d-flip.html',
          },
          {
            path: 'swiper-fade/',
            url: './pages/swiper-fade.html',
          },
          {
            path: 'swiper-scrollbar/',
            url: './pages/swiper-scrollbar.html',
          },
          {
            path: 'swiper-gallery/',
            componentUrl: './pages/swiper-gallery.html',
          },
          {
            path: 'swiper-custom-controls/',
            url: './pages/swiper-custom-controls.html',
          },
          {
            path: 'swiper-parallax/',
            url: './pages/swiper-parallax.html',
          },
          {
            path: 'swiper-lazy/',
            url: './pages/swiper-lazy.html',
          },
          {
            path: 'swiper-pagination-progress/',
            url: './pages/swiper-pagination-progress.html',
          },
          {
            path: 'swiper-pagination-fraction/',
            url: './pages/swiper-pagination-fraction.html',
          },
          {
            path: 'swiper-zoom/',
            url: './pages/swiper-zoom.html',
          },
        ],
      },
      {
        path: '/swipeout/',
        componentUrl: './pages/swipeout.html',
      },
      {
        path: '/tabs/',
        url: './pages/tabs.html',
      },
      {
        path: '/tabs-static/',
        componentUrl: './pages/tabs-static.html',
      },
      {
        path: '/tabs-animated/',
        componentUrl: './pages/tabs-animated.html',
      },
      {
        path: '/tabs-swipeable/',
        componentUrl: './pages/tabs-swipeable.html',
      },
      {
        path: '/tabs-routable/',
        url: './pages/tabs-routable.html',
        tabs: [
          {
            path: '/tab1/',
            id: 'tab1',
            content: ' \
            <div class="block"> \
              <p>Tab 1 content</p> \
              <p>滚滚长江东逝水，浪花淘尽英雄。是非成败转头空，青山依旧在，几度夕阳红。白发渔樵江渚上，惯看秋月春风。一壶浊酒喜相逢，古今多少事，都付笑谈中。</p> \
              <p>滚滚长江东逝水，浪花淘尽英雄。是非成败转头空，青山依旧在，几度夕阳红。白发渔樵江渚上，惯看秋月春风。一壶浊酒喜相逢，古今多少事，都付笑谈中。</p> \
              <p>滚滚长江东逝水，浪花淘尽英雄。是非成败转头空，青山依旧在，几度夕阳红。白发渔樵江渚上，惯看秋月春风。一壶浊酒喜相逢，古今多少事，都付笑谈中。</p> \
            </div> \
            ',
          },
          {
            path: '/tab2/',
            id: 'tab2',
            url: './pages/tabs-routable-content2.html',
          },
          {
            path: '/tab3/',
            id: 'tab3',
            componentUrl: './pages/tabs-routable-content3.html',
          },
        ],
      },
      {
        path: '/tabs-routable-pages/',
        componentUrl: './pages/tabs-routable-pages.html',
        tabs: [
          {
            path: '/tab1/',
            id: 'tab1',
            componentUrl: './pages/pull-to-refresh.html',
          },
          {
            path: '/tab2/',
            id: 'tab2',
            componentUrl: './pages/infinite-scroll.html',
          },
          {
            path: '/tab3/',
            id: 'tab3',
            componentUrl: './pages/inputs.html',
          },
        ],
      },
      {
        path: '/text-editor/',
        componentUrl: './pages/text-editor.html'
      },
      {
        path: '/toast/',
        componentUrl: './pages/toast.html',
      },
      {
        path: '/toggle/',
        componentUrl: './pages/toggle.html',
      },
      {
        path: '/toolbar-tabbar/',
        componentUrl: './pages/toolbar-tabbar.html',
        routes: [
          {
            path: 'tabbar/',
            componentUrl: './pages/tabbar.html',
          },
          {
            path: 'tabbar-labels/',
            componentUrl: './pages/tabbar-labels.html',
          },
          {
            path: 'tabbar-scrollable/',
            componentUrl: './pages/tabbar-scrollable.html',
          },
          {
            path: 'toolbar-hide-scroll/',
            url: './pages/toolbar-hide-scroll.html',
          },
        ],
      },
      {
        path: '/tooltip/',
        componentUrl: './pages/tooltip.html',
      },
      {
        path: '/treeview/',
        componentUrl: './pages/treeview.html',
      },
      {
        path: '/timeline/',
        url: './pages/timeline.html',
      },
      {
        path: '/timeline-vertical/',
        url: './pages/timeline-vertical.html',
      },
      {
        path: '/timeline-horizontal/',
        url: './pages/timeline-horizontal.html',
      },
      {
        path: '/timeline-horizontal-calendar/',
        url: './pages/timeline-horizontal-calendar.html',
      },
      {
        path: '/virtual-list/',
        componentUrl: './pages/virtual-list.html',
      },
      {
        path: '/virtual-list-vdom/',
        componentUrl: './pages/virtual-list-vdom.html',
      },
      {
        path: '/vi/',
        componentUrl: './pages/vi.html',
      },
    ],
  },
  {
    path: '/ionic-home',
    url: './pages/ionic/home.html',
    name: 'ionic-home',
    routes: [
      // Components
      {
        path: '/action-sheet/',
        componentUrl: './pages/ionic/action-sheet.html',
      },
      {
        path: '/dialog/',
        componentUrl: './pages/ionic/dialog.html',
      },
      {
        path: '/avatar/',
        componentUrl: './pages/ionic/avatar.html',
      },
      {
        path: '/badge/',
        componentUrl: './pages/ionic/badge.html',
      },
      {
        path: '/buttons/',
        componentUrl: './pages/ionic/buttons.html',
      },
      {
        path: '/cards/',
        url: './pages/ionic/cards.html',
      },
      {
        path: '/checkbox/',
        componentUrl: './pages/ionic/checkbox.html',
      },
      {
        path: '/chips/',
        componentUrl: './pages/ionic/chips.html',
      },
      {
        path: '/content/',
        url: './pages/ionic/content.html',
      },  
      {
        path: '/calendar/',
        componentUrl: './pages/ionic/calendar.html',
      },      
      {
        path: '/fab/',
        url: './pages/ionic/fab.html',
      },
      {
        path: '/grid/',
        url: './pages/ionic/grid.html',
      },
      {
        path: '/icons/',
        componentUrl: './pages/ionic/icons.html',
      },
      {
        path: '/infinite-scroll/',
        componentUrl: './pages/ionic/infinite-scroll.html',
      },
      {
        path: '/inputs/',
        componentUrl: './pages/ionic/inputs.html',
      },
      {
        path: '/item/',
        url: './pages/ionic/item.html',
      },
      {
        path: '/list/',
        url: './pages/ionic/list.html',
      },
      {
        path: '/contacts-list/',
        url: './pages/ionic/contacts-list.html',
      },
      {
        path: '/preloader/',
        componentUrl: './pages/ionic/preloader.html',
      },
      {
        path: '/panel/',
        url: './pages/ionic/panel.html',
      },
      {
        path: '/popup/',
        url: './pages/ionic/popup.html',
      },
      {
        path: '/navbar/',
        url: './pages/ionic/navbar.html',
      },
      {
        path: '/note/',
        url: './pages/ionic/note.html',
      },
      {
        path: '/picker/',
        componentUrl: './pages/ionic/picker.html',
      },
      {
        path: '/popover/',
        url: './pages/ionic/popover.html',
      },
      {
        path: '/progressbar/',
        componentUrl: './pages/ionic/progressbar.html',
      },
      {
        path: '/radio/',
        url: './pages/ionic/radio.html',
      },
      {
        path: '/range/',
        componentUrl: './pages/ionic/range.html',
      },
      {
        path: '/pull-to-refresh/',
        componentUrl: './pages/ionic/pull-to-refresh.html',
      },
      {
        path: '/sortable/',
        url: './pages/ionic/sortable.html',
      },
      {
        path: '/searchbar/',
        url: './pages/ionic/searchbar.html',
      },
      {
        path: '/segment/',
        componentUrl: './pages/ionic/segment.html',
      },
      {
        path: '/smart-select/',
        url: './pages/ionic/smart-select.html',
      },
      {
        path: '/skeleton/',
        componentUrl: './pages/ionic/skeleton.html',
      },
      {
        path: '/spinner/',
        componentUrl: './pages/ionic/spinner.html',
      },
      {
        path: '/swiper-horizontal/',
        url: './pages/ionic/swiper-horizontal.html',
      },
      {
        path: '/tabs/',
        url: './pages/ionic/tabs.html',
      },
      {
        path: '/text/',
        url: './pages/ionic/text.html',
      },
      {
        path: '/thumbnail/',
        url: './pages/ionic/thumbnail.html',
      },
      {
        path: '/toast/',
        componentUrl: './pages/ionic/toast.html',
      },
      {
        path: '/toggle/',
        componentUrl: './pages/ionic/toggle.html',
      },
      {
        path: '/toolbar/',
        url: './pages/ionic/toolbar.html',
      },
      
    ],    
  },

  {
    path: '/vant-home',
    url: './pages/vant/home.html',
    name: 'vant-home',
    routes: [
      // Components
      {
        path: '/action-sheet/',
        componentUrl: './pages/vant/action-sheet.html',
      },
      {
        path: '/dialog/',
        componentUrl: './pages/vant/dialog.html',
      },
      {
        path: '/avatar/',
        componentUrl: './pages/vant/avatar.html',
      },
      {
        path: '/badge/',
        componentUrl: './pages/vant/badge.html',
      },
      {
        path: '/buttons/',
        componentUrl: './pages/vant/buttons.html',
      },
      {
        path: '/cards/',
        url: './pages/vant/cards.html',
      },
      {
        path: '/checkbox/',
        componentUrl: './pages/vant/checkbox.html',
      },
      {
        path: '/chips/',
        componentUrl: './pages/vant/chips.html',
      },
      {
        path: '/content/',
        url: './pages/vant/content.html',
        name: 'vant-content',
      },     
      {
        path: '/fab/',
        url: './pages/vant/fab.html',
      },
      {
        path: '/grid/',
        url: './pages/vant/grid.html',
      },
      {
        path: '/icons/',
        componentUrl: './pages/vant/icons.html',
      },
      {
        path: '/infinite-scroll/',
        componentUrl: './pages/vant/infinite-scroll.html',
      },
      {
        path: '/inputs/',
        componentUrl: './pages/vant/inputs.html',
      },
      {
        path: '/item/',
        url: './pages/vant/item.html',
      },
      {
        path: '/list/',
        url: './pages/vant/list.html',
      },
      {
        path: '/contacts-list/',
        url: './pages/vant/contacts-list.html',
      },
      {
        path: '/preloader/',
        componentUrl: './pages/vant/preloader.html',
      },
      {
        path: '/menu/',
        componentUrl: './pages/vant/menu.html',
      },
      {
        path: '/dialog/',
        componentUrl: './pages/vant/dialog.html',
      },
      {
        path: '/navbar/',
        url: './pages/vant/navbar.html',
      },
      {
        path: '/note/',
        url: './pages/vant/note.html',
      },
      {
        path: '/picker/',
        componentUrl: './pages/vant/picker.html',
      },
      {
        path: '/popover/',
        url: './pages/vant/popover.html',
      },
      {
        path: '/progressbar/',
        componentUrl: './pages/vant/progressbar.html',
      },
      {
        path: '/radio/',
        url: './pages/vant/radio.html',
      },
      {
        path: '/range/',
        componentUrl: './pages/vant/range.html',
      },
      {
        path: '/pull-to-refresh/',
        componentUrl: './pages/vant/pull-to-refresh.html',
      },
      {
        path: '/sortable/',
        url: './pages/vant/sortable.html',
      },
      {
        path: '/searchbar/',
        url: './pages/vant/searchbar.html',
      },
      {
        path: '/segment/',
        url: './pages/vant/segment.html',
      },
      {
        path: '/smart-select/',
        url: './pages/vant/smart-select.html',
      },
      {
        path: '/skeleton/',
        componentUrl: './pages/vant/skeleton.html',
      },
      {
        path: '/spinner/',
        componentUrl: './pages/vant/spinner.html',
      },
      {
        path: '/swiper/',
        url: './pages/vant/swiper.html',
      },
      {
        path: '/tabs/',
        url: './pages/vant/tabs.html',
      },
      {
        path: '/text/',
        componentUrl: './pages/vant/text.html',
      },
      {
        path: '/thumbnail/',
        componentUrl: './pages/vant/thumbnail.html',
      },
      {
        path: '/toast/',
        componentUrl: './pages/vant/toast.html',
      },
      {
        path: '/toggle/',
        componentUrl: './pages/vant/toggle.html',
      },
      {
        path: '/toolbar-tabbar/',
        componentUrl: './pages/vant/toolbar-tabbar.html',
      },
      
    ],    
  },
  

  // Default route (404 page). MUST BE THE LAST
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];
