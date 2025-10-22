// components/demo7/index.js

const xrFrameSystem = wx.getXrFrameSystem();

xrFrameSystem.registerEffect('removeBlack', scene => scene.createEffect({
  name: "removeBlack",
  images: [{
    key: 'u_videoMap',
    default: 'white',
    macro: 'WX_USE_VIDEOMAP'
  }],
  defaultRenderQueue: 2000,
  passes: [{
    "renderStates": {
      cullOn: false,
      blendOn: true,
      blendSrc: xrFrameSystem.EBlendFactor.SRC_ALPHA,
      blendDst: xrFrameSystem.EBlendFactor.ONE_MINUS_SRC_ALPHA,
      cullFace: xrFrameSystem.ECullMode.BACK,
    },
    lightMode: "ForwardBase",
    useMaterialRenderStates: true,
    shaders: [0, 1]
  }],
  shaders: [
    // 顶点着色器 Vertex shaders
    `#version 100

uniform highp mat4 u_view;
uniform highp mat4 u_viewInverse;
uniform highp mat4 u_vp;
uniform highp mat4 u_projection;
uniform highp mat4 u_world;

attribute vec3 a_position;
attribute highp vec2 a_texCoord;

varying highp vec2 v_UV;

void main()
{
  v_UV = a_texCoord;
  vec4 worldPosition = u_world * vec4(a_position, 1.0);
  gl_Position = u_projection * u_view * worldPosition;
  }`,
    // 片段着色器 Fragment shaders
    `#version 100

precision mediump float;
precision highp int;
varying highp vec2 v_UV;

#ifdef WX_USE_VIDEOMAP
  uniform sampler2D u_videoMap;
#endif

void main()
{
#ifdef WX_USE_VIDEOMAP
  // 左右分屏透明视频处理：
  // 左半边 (0-0.5) 为彩色内容，右半边 (0.5-1.0) 为透明度遮罩
  
  // 1. 采样左半边获取 RGB 颜色
  vec2 colorUV = vec2(v_UV.x * 0.5, v_UV.y);
  vec4 color = texture2D(u_videoMap, colorUV);
  
  // 2. 采样右半边获取 Alpha 遮罩
  vec2 alphaUV = vec2(v_UV.x * 0.5 + 0.5, v_UV.y);
  vec4 alphaSample = texture2D(u_videoMap, alphaUV);
  float alpha = alphaSample.r; // 使用红色通道作为透明度（灰度值）
  
  // 3. 输出颜色 + 遮罩透明度（不做伽马校正，避免变暗）
  gl_FragData[0] = vec4(color.rgb, alpha);
#else
  gl_FragData[0] = vec4(1.0, 1.0, 1.0, 1.0);
#endif
}
`],
}));

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
    loaded: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleReady({
      detail
    }) {
      console.log('handleReady', detail.value)
    },
    handleAssetsProgress({ detail }) {
      console.log('assets progress', detail.value)
    },
    handleAssetsLoaded({ detail }) {
      console.log('assets loaded', detail.value)
      this.setData({ loaded: true })
    },
  }
})