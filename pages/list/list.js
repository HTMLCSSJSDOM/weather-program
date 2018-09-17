// pages/list/lis.js
const dayMap = ['星期天','星期一','星期二','星期三','星期四','星期五','星期六']

Page({
  data: {
    weekWeather: [],
    city: '',
  },
  onLoad: function (query) {
    console.log(query.city)
   this.setData({
     city: query.city
   })
    this.getWeekWeather() 
  },
  getWeekWeather(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        city: this.data.city,
        time: new Date().getTime()
      },
      success: res => {
        let result = res.data.result
        this.setWeekWeather(result)
      },
      complete: () => {
        callback && callback()
      }
    })
  },
  setWeekWeather(result){
    let weekWeather = []
    for(let i = 0;i < 7;i++){
        let date = new Date()
        date.setDate(date.getDate() + i)  //重新设置日期
        weekWeather.push({
          day: dayMap[date.getDay()],
          date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay()}`,
          temp: `${result[i].minTemp}°-${result[i].maxTemp}°`,
          iconPath: `/images/${result[i].weather}-icon.png`
        })
    }
    this.setData({
      weekWeather
    })
  },
  onPullDownRefresh(){
    this.setWeekWeather(() => {
      wx.stopPullDownRefresh()
    })
  }
})