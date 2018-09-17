const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}
const weatherColorMap = {
  'sunny': '#cdeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}
const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

const QQMapWX = require('../../libs/qqmap-wx-jssdk.js');


Page({
  data: {
    temp: '',
    weather: '',
    nowWeatherBackground: '',
    hourlyWeather: [],
    todayTemp: '',
    todayText: '',
    city: '广州市',
   
    locationAuthType: UNPROMPTED
  },
  onPullDownRefresh(){
      this.getNow(() => {
        wx.stopPullDownRefresh()
      })
  },
  onLoad() {
    this.qqmapsdk = new QQMapWX({
      key: 'HRRBZ-4C2OO-IM7WI-SWDUJ-G4JDJ-WPFRW'
    });
    wx.getSetting({
        success: res => {
          let auth = res.authSetting['scope.userLocation']
          this.setData({
            locationAuthType: auth? AUTHORIZED: (auth === false)? UNAUTHORIZED: UNPROMPTED
          })
          this.getLocation()
        }
    })
    this.getNow()
  },
  getNow(callback){
      wx.request({
        url: 'https://test-miniprogram.com/api/weather/now',
        data: {
          city: this.data.city
        },
        success: res => {
          let result = res.data.result
           this.setNow(result)
          this.setHourlyWeather(result)
          this.setToday(result)
        },
        complete: () => {
          callback && callback()
        }
      })
  },
  setNow(result){
       let temp = result.now.temp + '°'
          , weather = result.now.weather
          this.setData({
            temp,
            weather: weatherMap[weather],
            nowWeatherBackground: `/images/${weather}-bg.png`
        })
        wx.setNavigationBarColor({
          frontColor: '#ffffff',
          backgroundColor: weatherColorMap[weather],
        })
  },
  setHourlyWeather(result){
    let nowHour = new Date().getHours()
    let forecast = result.forecast

    let hourlyWeather = []
    for (let i = 0; i < 8; i++) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: `/images/${forecast[i].weather}-icon.png`,
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = "今天"
    this.setData({
      hourlyWeather
    })
  },
  setToday(result){
    let date = new Date()
      let today = result.today
      
      this.setData({
        todayText: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}今天`,
        todayTemp: `${today.minTemp}°-${today.maxTemp}°`
        })
  },
  onTapTodayWeather(){
    console.log(this.data.city)
    wx.navigateTo({
      url: `/pages/list/list?city=${this.data.city}`
    })
  },
  onTapLocation(){
    if(this.data.locationAuthType == 1){
      wx.openSetting({
        success: res => {
          let auth = res.authSetting['scope.userLocation']
            if(auth && this.data.locationAuthType !== 2){
              this.setData({
                locationAuthType: AUTHORIZED
    
              })
              this.getLocation()
            }
        }
      })
    }else{
      this.getLocation()
    }
  },
  // onShow(){
  //   //获取当前用户的权限状态
  //   wx.getSetting({
  //     success: res => {
  //       let auth = res.authSetting['scope.userLocation']
  //       console.log(auth)
  //           if(auth && this.data.locationAuthType !== AUTHORIZED){
  //               console.log(1111)
  //               this.setData({
  //                 locationAuthType: AUTHORIZED,
  //                 locationTips: AUTHORIZED_TIPS
  //               })
  //               this.getLocation()
  //           }
  //     }
  //   })
  // },
  getLocation(){
    wx.getLocation({
      type: 'wgs84',
      success: res => {
        this.setData({
          locationAuthType: AUTHORIZED
     
        })
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city
            this.setData({
              city
            })
            this.getNow()
          }
        })
      },
      fail: res => {
        this.setData({
          locationAuthType: UNAUTHORIZED
    
        })
      }
    })
  }
})

// console.log(page) 没有返回值
