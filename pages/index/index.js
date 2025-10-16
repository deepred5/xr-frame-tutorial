// index.js

Page({
  data: {
    motto: 'Hello World',
  },
  handleTap(event) {
    const {
      type
    } = event.target.dataset

    wx.navigateTo({
      url: `../${type}/index`
    })
  },
})
