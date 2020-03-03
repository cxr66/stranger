<template>
  <div class="camera"  v-loading="loading">
      <p class="title">
          陌生人管理系统
          <span class="loginOut" @click="loginout()">退出系统</span>
      </p>
      <!-- 筛选条件 -->
      <div class="search">
        
        <el-button type="primary" @click="reload()" size="mini">刷新</el-button> 
        
        <el-button class="fr" type="primary" @click="navigate('/index')" size="mini">返回</el-button> 
        
      </div>

      <!-- 列表清单部分 -->
      <div class="table">
        <table>
          <thead>
            <tr>
              <th>序 号</th>
              <th>摄像头名称</th>
              <th>IP地址</th>
              <th>MAC地址</th>
              <th>已录总人数</th>
              <!-- <th>已录客人数</th>
              <th>已录员工数</th> -->
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item,index) in cameraList" :key="index">
              <td>{{ index+1 }}</td>
              <td>{{ item.csServerName }}</td>
              <td>{{ item.csIpaddr }}</td>
              <td>{{ item.csMac }}</td>
              <td>{{ item.total_heads }}</td>
             <!--  <td>{{ item.total_guests }}</td>
              <td>{{ item.total_employees }}</td> -->
              <td><span v-if="item.csServerName">正常</span> <span v-else>异常</span></td>
               </tr>
          </tbody>
        </table>
        <p v-if="cameraList.length==0" style="padding: 20px 0;text-align:center;">当前暂无数据</p>
        <div class="pagination">
          <el-pagination
            @current-change="handleCurrentPageChange"
            :current-page="currentPage"
            :page-size="pagesize"
            layout="total, prev, pager, next, jumper"
            :total="total"
          ></el-pagination>
        </div>
      </div>
  </div>
</template>

<script>
const synth = window.speechSynthesis;
const msg = new SpeechSynthesisUtterance();
export default {
  name: 'camera',
  data () {
    return {
        /* 分页 */
        currentPage: 1,
        pagesize: 15,
        total: 0,
        loading: true,
        /* 列表 */
        cameraList:[ ],
        hotelInfo: ''
    }
  },
  created(){
    let that = this;
    this.hotelInfo = JSON.parse(localStorage.getItem('hotelInfo'));
    this.handleCurrentPageChange(that.currentPage,that.pagesize);
  },
  destroyed: function() {

  },
  methods:{
    /* 跳转函数 */
    navigate(path){
      this.$router.push({ path: path });
    },

      loginout(){
          //logout
          let that = this;
          this.$confirm('确认退出吗?', '提示', {
            confirmButtonClass: 'el-button--warning'
          }).then(() => {
            that.websocketclose();
            that.$router.push({ path: '/' });
          }).catch(() => {

          });
      },
    reload(){
        let that = this;
        that.currentPage=1;
        that.handleCurrentPageChange(that.currentPage,that.pagesize);
    },
      /* 
        **分页 **
      */
      handleCurrentPageChange(currentPage,pagesize) {
        let that = this, url = this.$api.api_duty + "camera/server/hotel_cameras";
        that.loading = true;
        that.$axios({
          method: "get",
          url: url,
          params: {
            page_num: currentPage,
            page_size:pagesize, 
          }
        }).then(function(res) {
          console.log(res.data);
          if(res.data.message == 'success'){
       

            that.cameraList = res.data.data;
            
            that.total = res.data.data.length;
          }else if(res.data.data.message === 'authorization invalid' && res.data.data.message === 'fail'){
            that.$router.push({ path: '/login' });
              that.$message.error('获取数据失败，失败原因：' + res.data.message);
          }else{
            that.$message.error('获取数据失败，失败原因：' + res.data.message);
          }

          that.loading = false;
        }).catch(function(err) {
            console.info(err);
            that.loading = false;
        });
      },

 
    }
  }
</script>
 
<style scoped lang='less'>
/* 标题 */
.title{
  font-size:30px;
  font-family:PingFang SC;
  font-weight:bolder;
  margin: 0 0 10px 0;
  color: #000;
  // color:rgba(70,160,252,1);
  text-shadow:0px 0px 0px rgba(204,204,204,1); 
  text-align: center;
  line-height:100px;
  background:linear-gradient(0deg,rgba(202,222,229,1) 0%,rgba(238,246,250,1) 100%);
  box-shadow:0px 1px 0px 0px rgba(204,204,204,1);
  text-stroke: 1px #ffffff;
  -webkit-text-stroke: 1px #ffffff;
  position: relative;
}
.loginOut{
  position: absolute;
  top: 10px;
  right: 10px; 
  font-weight:bolder;
  cursor: pointer;
}
.wid_25{
	width: 25%;
}
.wid_49{
	width: 49%;
}
.underline{
  text-decoration: underline;
}
.handle{
  cursor: pointer;
}
.radius{
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
} 
.bg_red{
  background-color: #ff0000;
}


.search {
  width: 96%; 
  overflow: hidden;
  margin: 16px auto;
  font-size: 18px;
  font-weight: bolder;
  }
.add_per{
  color: #46A0FC;
  font-size: 18px;
  cursor: pointer;
} 

 /* 头部后台读取数据 */
.table {
    width: 96%;
    margin: auto;
    font-size: 14px;
    border: #cccccc 1px solid;
    table {
      width: 100%;
      border-collapse: collapse;
      border-spacing: 0;
      text-align: center;
      thead {
        line-height: 40px;
        color: #000000;
        tr {
          th {
            font-weight: bold;
            font-size: 16px;
            background:rgba(205,224,231,1);
          }
        }
      }
      tbody {
        line-height: 40px;
        color: #333333;
        tr {
          cursor: pointer; 
          td {
            padding: 10px 0;
            border: 1px solid #cccccc; 
            .td-img{
                width: 100px;
                margin: auto;
            }
          }
          span {
            color: #68819e;
            cursor: pointer;
          }
          .col {
            border: 1px #68819e solid;
            margin: 0 10px;
          }
        }
        tr:hover {
          background-color: #eeeeee;
        }
      }
    }
}
  // 分页
.pagination {
    margin: 36px 0 14px 0;
    overflow: hidden;
    p {
      margin-left: 20px;
    }
    .el-pagination.is-background .el-pager li:not(.disabled).active {
      background-color: #68819e;
      color: #fff;
    }
}
</style>
