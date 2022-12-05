import * as tf from '@tensorflow/tfjs-core'
import * as tfc from '@tensorflow/tfjs-converter'
import * as posenet from '@tensorflow-models/posenet'
import { getFrameSliceOptions } from '../utils/util'
import { drawKeypoints, drawSkeleton } from './util'

// const POSENET_URL = 'https://www.gstaticcnapps.cn/tfjs-models/savedmodel/posenet/mobilenet/float/050/model-stride16.json';
const POSENET_URL =
  'https://ydcommon.51yund.com/tfjs-models/savedmodel/posenet/mobilenet/float/050/model-stride16.json'

const POSENET_BIN_URL = ''
const STORAGE_KEY = 'posenet_model'

export class Classifier {
  // 指明前置或后置 front|back
  cameraPosition
  // 图像显示尺寸结构体 { width: Number, height: Number }
  displaySize
  // 神经网络模型
  poseNet
  // ready
  ready
  constructor(cameraPosition, displaySize) {
    this.cameraPosition = cameraPosition
    this.displaySize = {
      width: displaySize.width,
      height: displaySize.height,
    }
    this.ready = false
  }
  load() {
    return new Promise(async (resolve, reject) => {
      const localStorageHandler =
        getApp().globalData.localStorageIO(STORAGE_KEY)
      try {
        this.loadModel = await tfc.loadGraphModel(localStorageHandler)
      } catch (e) {
        this.loadModel = await tfc.loadGraphModel(POSENET_URL)
        this.loadModel.save(localStorageHandler)
      }
      posenet
        .load(this.loadModel)
        .then((model) => {
          this.poseNet = model
          this.ready = true
          resolve()
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  isReady() {
    return this.ready
  }

  detectSinglePose(frame, type) {
    return new Promise((resolve, reject) => {
      const video = tf.tidy(() => {
        const temp = tf.tensor(new Uint8Array(frame.data), [
          frame.height,
          frame.width,
          4,
        ])
        const sliceOptions = getFrameSliceOptions(
          this.cameraPosition,
          frame.width,
          frame.height,
          this.displaySize.width,
          this.displaySize.height,
        )
        return temp
          .slice(sliceOptions.start, sliceOptions.size)
          .resizeBilinear([this.displaySize.height, this.displaySize.width])
      })

      // since images are being fed from a webcam
      const flipHorizontal = false
      if (type == 'multiple') {
        this.poseNet
          .estimateMultiplePoses(video, { flipHorizontal })
          .then((pose) => {
            video.dispose()
            resolve(pose)
          })
          .catch((err) => {
            reject(err)
          })
      } else {
        this.poseNet
          .estimateSinglePose(video, { flipHorizontal })
          .then((pose) => {
            video.dispose()
            resolve(pose)
          })
          .catch((err) => {
            reject(err)
          })
      }
    })
  }

  drawSinglePose(ctx, pose) {
    if (!ctx && !pose) {
      return
    }

    const minPoseConfidence = 0.3
    const minPartConfidence = 0.3

    if (Array.isArray(pose)) {
      pose.forEach((element) => {
        if (element.score >= minPoseConfidence) {
          drawKeypoints(element.keypoints, minPartConfidence, ctx)
          drawSkeleton(element.keypoints, minPartConfidence, ctx)
        }
      })
    } else {
      if (pose.score >= minPoseConfidence) {
        drawKeypoints(pose.keypoints, minPartConfidence, ctx)
        drawSkeleton(pose.keypoints, minPartConfidence, ctx)
      }
    }

    ctx.draw()
    return pose
  }

  dispose() {
    this.poseNet.dispose()
  }
}
