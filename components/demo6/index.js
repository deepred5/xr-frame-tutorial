// components/demo6/index.js

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
    meshesVisible: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleReady: function ({ detail }) {
      const xrFrameSystem = wx.getXrFrameSystem()
      const createFrameEffect = (scene) => {
        return scene.createEffect({
          name: 'frame-effect',
          properties: [
            {
              key: 'columCount', // 列数
              type: xrFrameSystem.EUniformType.FLOAT,
              default: 1
            },
            {
              key: 'rowCount', // 行数
              type: xrFrameSystem.EUniformType.FLOAT,
              default: 1
            },
            {
              key: 'during', // 持续时间
              type: xrFrameSystem.EUniformType.FLOAT,
              default: 1
            }
          ],
          images: [
            {
              key: 'u_baseColorMap',
              default: 'white',
              macro: 'WX_USE_BASECOLORMAP'
            }
          ],
          // 透明物体需要大于`2500`！
          defaultRenderQueue: 2501,
          passes: [
            {
              renderStates: {
                blendOn: false,
                depthWrite: true,
                cullOn: false,
                // 基础库 v3.0.1 开始 默认的 plane 切为适配 cw 的顶点绕序
              },
              lightMode: 'ForwardBase',
              useMaterialRenderStates: true,
              shaders: [0, 1]
            }
          ],
          shaders: [
            // 顶点着色器 Vertex shaders
            `#version 100

          precision highp float;
          precision highp int;
    
          attribute vec3 a_position;
          attribute highp vec2 a_texCoord;
      
          uniform mat4 u_view;
          uniform mat4 u_projection;
          uniform mat4 u_world;
          varying highp vec2 v_uv;
          void main()
          {
            v_uv = a_texCoord;
            gl_Position = u_projection * u_view * u_world * vec4(a_position, 1.0);
          }`,
            // 片段着色器 Fragment shaders
            `#version 100
            precision highp float;
            precision highp int;

            uniform sampler2D u_baseColorMap;
            uniform highp float u_gameTime;
            uniform highp float rowCount;
            uniform highp float columCount;
            uniform highp float during;
            varying highp vec2 v_uv;
            void main()
            {
              float loopTime = mod(u_gameTime, during);

              float tickPerFrame = during / (columCount * rowCount);
              
              float columTick = mod(floor(loopTime / tickPerFrame), columCount);
              float rowTick = floor(loopTime / tickPerFrame / columCount);

              vec2 texCoord = vec2(v_uv.x / columCount + (1.0 / columCount) * columTick , v_uv.y / rowCount + (1.0 / rowCount) * rowTick);
              vec4 color = texture2D(u_baseColorMap, texCoord);
              gl_FragColor = color;
            }`
          ],
        });
      }
      xrFrameSystem.registerEffect('frame-effect', createFrameEffect)
      this.scene = detail.value

      this.loadAsset()
    },

    async loadAsset() {
      const xrFrameSystem = wx.getXrFrameSystem();
      const xrScene = this.scene;

      await xrScene.assets.loadAsset({
        type: 'texture',
        assetId: 'lzy',
        src: 'https://assets.papegames.com/resources/cdn/20251022/0ac5e7c80c0fc262.png',
      })

      // 第一个参数是效果实例的引用，第二个参数是默认`uniforms`
      const frameMaterial = xrScene.createMaterial(
        // 使用定制的效果
        xrScene.assets.getAsset('effect', 'frame-effect'),
        { u_baseColorMap: xrScene.assets.getAsset('texture', 'lzy') }
      )

      // 可以将其添加到资源系统中备用
      xrScene.assets.addAsset('material', 'frame-effect', frameMaterial)


      const meshElement = xrScene.getElementById('animation-mesh').getComponent(xrFrameSystem.Mesh)
      frameMaterial.setFloat('columCount', 4)
      frameMaterial.setFloat('rowCount', 8)
      frameMaterial.setFloat('during', 1)
      frameMaterial.alphaMode = "BLEND"
      meshElement.material = frameMaterial


      this.setData({
        meshesVisible: true
      })
    },
  }
})