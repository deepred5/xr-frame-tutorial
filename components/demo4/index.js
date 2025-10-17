// components/demo4/index.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleReady: function ({ detail }) {
      this.scene = detail.value;
    },
    handleAssetsLoaded: function ({ detail }) {
      this.setData({ loaded: true });
    },
    handleTrackerSwitch: function ({ detail }) {
      const active = detail.value;
      const video = this.scene.assets.getAsset('video-texture', 'hikari');
      active ? video.play() : video.stop();
    }
  }
})