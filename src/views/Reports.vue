<template>
  <div>
    <breadcrumb :itemList="['数据统计', '数据报表']" />
    <el-card>
      <div id="main" style="width: 888px;height:500px;"></div>
    </el-card>
  </div>
</template>

<script>
import Breadcrumb from '../components/common/Breadcrumb'
import echarts from 'echarts'
export default {
  name: 'Report',
  data() {
    return {
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        // xAxis: [
        //   {
        //     boundaryGap: false
        //   }
        // ],
        // yAxis: [
        //   {
        //     type: 'value'
        //   }
        // ]
      }
    }
  },
  // created() {
  //   this.getChartList()
  // },
  components: {
    Breadcrumb
  },
  mounted() {
    let myChart = echarts.init(document.getElementById('main'))
    this.$http.get('reports/type/1').then(res => {
      console.log(res)
      if (res.data.meta.status !== 200)
        return this.$message.error('获取图表数据失败')
      this.$message.success('获取图表数据成功')
      // 将上面合并向数组内容直接加在返回来的数组中
      res.data.data.yAxis.push({type: 'value'})
      res.data.data.xAxis.push({boundaryGap: false})
      let chartList = {...res.data.data, ...this.options} 
      // let chartList = Object.assign(res.data.data, this.options)
      myChart.setOption(chartList)
    })
  },
  methods: {
    // getChartList() {
    //   this.$http.get('reports/type/1').then(res => {
    //     console.log(res)
    //     if(res.data.meta.status !== 200) return this.$message.error('获取图表数据失败')
    //     this.$message.success('获取图表数据成功')
    //     this.chartList = res.data.data
    //     console.log(this.chartList)
    //   })
    // }
  }
}
</script>

<style>
</style>