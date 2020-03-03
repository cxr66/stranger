<template>
  <div class="index"  v-loading="loading">
      <p class="title">
          陌生人管理系统
          <span class="loginOut" @click="loginout()">退出系统</span>
      </p>
      <!-- 筛选条件 -->
      <div class="search">
        筛选：  
        <el-button type="primary" @click="handleCurrentPageChange(1,'')" size="mini">全部</el-button> 
        <el-select v-model="eventType" filterable placeholder="请选择" size="mini" style="margin: 0 10px;">
          <el-option v-for="(item,index) in eventTypeData" :key="index" :label="item.desc" :value="item.code" ></el-option>
        </el-select>
        <el-button type="primary" @click="handleCurrentPageChange(1,eventType)" size="mini">查询</el-button> 
        <el-switch class="fr" v-model="tipsShow" active-color="#46A0FC" active-text="显示通知" inactive-color="#dcdfe6"></el-switch>
        <p class="fr add_per" @click="navigate('/person')">员工录入</p>
        <p class="fr add_per" @click="navigate('/camera')">酒店摄像头信息</p>
        
      </div>

      <!-- 列表清单部分 -->
      <div class="table">
        <table>
          <thead>
            <tr>
              <th>序 号</th>
              <th>人员类型</th>
              <th>人员姓名</th>
              <th>位置</th>
              <th>时间</th>
              <th>脸图</th>
              <th>场景图</th>
              <th>备注</th>
              <th>操作/状态</th> 
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item,index) in photoList" :key="index" @click="get_face_by_id(item.id)" >
              <td>{{ item.id }}</td>
              <td><span v-if="item.event_type">陌生人</span> <span v-else>员工/已登记访客</span></td>
              <td>{{ item.person_name }}</td>
              <td>{{ item.camera_name }}</td>
              <td>{{ item.event_time }}</td>
               <td>
                  <img v-preview=" item.face_img_ids " class="td-img" v-lazy=" item.face_img_ids " alt="" preview-title-enable="true" preview-nav-enable="true" >   
              </td>
              <td>
                  <img v-preview=" item.url_img " class="td-img" v-lazy=" item.url_img " alt="" preview-title-enable="true" preview-nav-enable="true" >   
              </td>
              <td>{{ item.remark }}</td>
              <td class="font_bold"> <span v-if=" item.checked ">处理完成 </span><span v-else style="color: #ff0000;" class="underline" >未处理 <i class="radius bg_red"></i> </span> </td>
            </tr>
          </tbody>
        </table>
        <p v-if="photoList.length==0" style="padding: 20px 0;text-align:center;">当前暂无数据</p>
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
      <!-- 
          对陌生人详情弹窗
       -->
      <el-dialog title="详情" :visible.sync="dialogVisible" width="60%" :before-close="handleClose">
        <div class="item-box ">
            <div class="inline_block wid_49 item">  
              <p class="wid_25 inline_block">编号：</p>
              <p class="inline_block">{{ singleData.camera_num }}</p>
            </div>
            <div class="inline_block wid_49 item">
              <p class="wid_25 inline_block">位置：</p>
              <p class="inline_block">{{ singleData.camera_name }}</p>
            </div>
            <div class="inline_block wid_49 item">
              <p class="wid_25 inline_block">时间：</p>
              <p class="inline_block">{{ singleData.event_time }}</p>
            </div>
            <div class="inline_block wid_49 item">
              <p class="wid_25 inline_block">处理状态：</p>
              <p class="inline_block"><span class="color_blue" v-if=" singleData.checked ">已处理完成 </span><span v-else  class="handle color_red underline" @click="handleVisible = true">未处理  <i class="radius bg_red"></i></span> </p>
            </div>

            <div class="inline_block item">
              陌生人图片：
            </div>

            <ul class="inline_block item single-img-list">
              <li v-for="(item,index) in singleData.photo_ids" :key="index">
                <img v-preview=" item " class="single-img" v-lazy=" item " alt="" preview-title-enable="true" preview-nav-enable="true" >   
              </li>
            </ul>
        </div>
        <!-- 
          对陌生人进行处理弹窗
       -->
        <el-dialog title="处理" :visible.sync="handleVisible" width="40%" :before-close="handleEditClose" append-to-body>
          <div class="item-box ">
              <div class="item">
                <p class="wid_25 inline_block">备注：</p> 
              </div> 
              <div class="item"> 
                <textarea v-model="remark" name="" id="" cols="30" rows="10"></textarea>
              </div> 
              <div class="item fr"> 
                <el-button type="primary" @click="update_by_id(singleData.id)">确认处理</el-button>
              </div> 
          </div>
        </el-dialog>
    </el-dialog>

    <!-- 
        陌生人提示弹框
     -->
    <div class="modal" v-show="tipsVisible" @click=" tipsVisible=false "></div>
    <div v-show="tipsVisible" class="tipsModal"  >
      <div class="tipsHeader"></div>
      <div class="tipsInner">
          <div class="innerTop">
            <div class="innerTopBg">
              <img :src=" tipsData.face_img_ids_0 " alt="">
            </div>
          </div>
          <div class="innerBot">
              <img :src="tipsGtImg" alt="">
              <p>陌生人</p>
              <p>请到前台登记</p>
          </div>
      </div>
      <div class="tipsFooter">
          位置：{{ tipsData.camera_name }}
      </div>
    </div>
  </div>
</template>

<script>
const synth = window.speechSynthesis;
const msg = new SpeechSynthesisUtterance();
export default {
  name: 'index',
  data () {
    return {
        /* 分页 */
        currentPage: 1,
        pagesize: 15,
        total: 0,

        loading: true,
        /* 列表 */
        photoList:[ ],
        /* 单条 */
        singleData: '',
        /* 对陌生人详情弹窗 */
        dialogVisible: false,
        /* 提示弹窗 */
        tipsVisible:false,
        tipsShow: true,
        tipsData: '',
        tipsImg: require('@/assets/index-tips.png'),
        tipsGtImg: require('@/assets/index-tips-gt.png'),
        /* 对陌生人进行处理弹窗 */
        handleVisible: false,
        remark: '',

        /* websocket */
         websock: null,
        /* 
            ** 事件类型
        */
        eventType: '',
        eventTypeData: [
          {
            desc: '陌生人',
            code: '1'
          },
          {
            desc: '已登记访客/员工',
            code: '0'
          }
        ],
        hotelInfo: '',
        interval: ''
    }
  },
  created(){
    let that = this;
    this.hotelInfo = JSON.parse(localStorage.getItem('hotelInfo'));
  
    this.handleCurrentPageChange(1,'');
/*     that.interval = setInterval(function(){
      that.handleCurrentPageChange(1,'');
    },1000*60*5) */
    
    /* 语音播放 */
    this.handleSpeak('欢迎进入颐陆陌生人管理系统');
    this.gamemuiscs1 = new Audio("https://eloadspider.com/tips.mp3");

    
  },
  destroyed: function() {
    let that =this;
    this.websocketclose();
    /* clearInterval(that.interval); */
  },
  methods:{
    /* 跳转函数 */
    navigate(path){
      this.$router.push({ path: path });
    },
      muiscPlay(){
          
          this.gamemuiscs1.play();
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
      handleClose(done) {
        this.dialogVisible = false;
      },
      handleEditClose(){
        this.handleVisible = false;
      },
      /* 
        ** 根据id获取单条数据 **
      */
    get_face_by_id(id){ 
      let that = this, url = this.$api.api_duty + 'camera/face_event/get/' + id;
        that.dialogVisible = true;
        that.singleData = '';
        that.$axios.get(url).then(function(res) { 
          if(res.data.message == 'success'){
            res.data.data.camera_name = res.data.data.camera_name.split('_')[0] + '酒店' + res.data.data.camera_name.split('_')[1] + '栋' + res.data.data.camera_name.split('_')[2] + '层' + res.data.data.camera_name.split('_')[3] ;

            if(res.data.data.photo_ids){
              let url = [];
              for (let i in res.data.data.photo_ids.split(',')){
                url.push(that.$api.api_img + 'camera_face_event/' + res.data.data.photo_ids.split(',')[i]+".jpg") 
              }
              res.data.data.photo_ids = url;
            }
            
            if(res.data.data.face_img_ids){
              let face_url = [];
              for (let i in res.data.data.face_img_ids.split(',')){
                face_url.push(that.$api.api_img + 'camera_face_event/' + res.data.data.face_img_ids.split(',')[i]+".jpg") 
              }
              res.data.data.face_img_ids = face_url;
            }
 

            that.singleData = res.data.data;
          }else{
            that.$message.error('获取失败，失败原因：' + res.data.message);
          }


        }).catch(function(err) { 
        });
    },
    /* 
        ** 根据id更新单条数据 **
      */
    update_by_id(id){ 
      let that = this, url = this.$api.api_duty + 'camera/face_event/update/' + id;
        that.$axios.post(url,{remark: that.remark, checked: 1 }).then(function(res) {
            if(res.data.message == 'success'){
              that.handleVisible = false;
              that.get_face_by_id(id);
              that.handleCurrentPageChange(that.currentPage,that.eventType);
            }else{
              that.$message.error('更新失败，失败原因：' + res.data.message);
            }


        }).catch(function(err) {
            console.info(err);
        });
    },
      /* 
        **分页 **
      */
      handleCurrentPageChange(currentPage,event_type) {
        let that = this, url = this.$api.api_duty + "camera/face_event/list";
        /* websocket */
        that.initWebSocket();
        that.eventType = event_type;
        that.$axios({
          method: "get",
          url: url,
          params: {
            page_num: currentPage,
            page_size:15,
            event_type: event_type
          }
        }).then(function(res) { 
          if(res.data.message == 'success'){
            for (let i in res.data.data.list){
              res.data.data.list[i].camera_name = res.data.data.list[i].camera_name.split('_')[0] + '酒店' + res.data.data.list[i].camera_name.split('_')[1] + '栋' + res.data.data.list[i].camera_name.split('_')[2] + '层' + res.data.data.list[i].camera_name.split('_')[3] ;
              if(res.data.data.list[i].photo_ids && res.data.data.list[i].photo_ids.split(',').length){
                res.data.data.list[i].url_img = that.$api.api_img + 'camera_face_event/' + res.data.data.list[i].photo_ids.split(',')[0]+".jpg";
                res.data.data.list[i].face_img_ids = that.$api.api_img + 'camera_face_event/' + res.data.data.list[i].face_img_ids+".jpg";
                
              }else{
                res.data.data.list[i].url_img = that.$api.api_img + 'camera_face_event/' + res.data.data.list[i].photo_ids +".jpg";
                res.data.data.list[i].face_img_ids = that.$api.api_img + 'camera_face_event/' + res.data.data.list[i].face_img_ids+".jpg";
              } 
            } 
 

            that.photoList = res.data.data.list;
            
            that.total = res.data.data.total_count;
          }else if(res.data.data.message === 'authorization invalid' && res.data.data.message === 'fail'){
            that.websocketclose();
            that.$router.push({ path: '/login' });
              that.$message.error('获取数据失败，失败原因：' + res.data.message);
          }else{
            that.websocketclose();
            that.$message.error('获取数据失败，失败原因：' + res.data.message);
          }

          that.loading = false;
        }).catch(function(err) {
            console.info(err);
            that.loading = false;
        });
      },
      /* 
          ** 根据条件筛选陌生人与访客
      */
      checkSearch(){

      },
      /* 
        ** websocket **
      */
    initWebSocket(){ //初始化weosocket 
      const wsurl = this.$api.api_ws + "/ws/miss/" + this.hotelInfo.hotel_id + "/";//ws地址
      // console.log(wsurl); 
      this.websocket = new WebSocket(wsurl); 
      this.websocket.onopen = this.websocketonopen;
      this.websocket.onerror = this.websocketonerror;
      this.websocket.onmessage = this.websocketonmessage; 
      this.websocket.onclose = this.websocketclose;
    }, 
    websocketonopen() { // 连接成功
      console.log("WebSocket连接成功");
       
    },
    websocketonerror(e) { // 链接错误
      console.log("WebSocket连接发生错误");
    },
    websocketonmessage(e){ //数据接收  
      const data = JSON.parse(e.data);
      let that = this; 
      console.log(data)
      if(data){ 
          const h = this.$createElement;   
          console.log(data.camera_name.split('_'))
          data.camera_name = data.camera_name.split('_')[0] + '酒店' + data.camera_name.split('_0')[1] + '栋' + data.camera_name.split('_')[2] + '层' + data.camera_name.split('_')[3] ;
          if(data.photo_ids && data.photo_ids.split(',').length){
            data.url_img = that.$api.api_img + 'camera_face_event/' + data.photo_ids.split(',')[0]+".jpg";
            
          }else{
            data.url_img = that.$api.api_img +  'camera_face_event/' + data.photo_ids +".jpg"
          }   

          if(data.face_img_ids && data.face_img_ids.split(' ,').length){
            data.face_img_ids_0 = that.$api.api_img + 'camera_face_event/' + data.face_img_ids.split(',')[0]+".jpg"
            data.face_img_ids = that.$api.api_img + 'camera_face_event/' + data.face_img_ids.split(',')[0] +".jpg";
          }else{
            data.face_img_ids_0 = that.$api.api_img + 'camera_face_event/' + data.face_img_ids +".jpg"
            data.face_img_ids = that.$api.api_img + 'camera_face_event/' + data.face_img_ids+".jpg";
          }   

          that.photoList.unshift(data);

          if(this.photoList.length%20 === 0){
            that.handleCurrentPageChange(1,that.eventType);
          
          }
          if(this.tipsShow){
            this.tipsData = data;
            this.tipsVisible = true;

            setTimeout(function(){
              that.tipsVisible = false;
            },5000)
          }
          this.$notify({
            title: '提示',
            message: h('i', { style: 'color: teal'}, '请注意有新的陌生人闯入！！！')
          });
          this.muiscPlay();
          // this.handleSpeak('请注意有新的陌生人闯入');
 
      }
    }, 
    websocketsend(agentData){//数据发送  f
      this.websock.send(agentData); 
    }, 
    websocketclose(e){ //关闭 
      console.log("connection closed  "); 
    },
    /* 
      ** 语音播报
    */
    handleSpeak(e){
      msg.text = e;
      msg.lang = 'zh-CN';
      msg.volume = '1';
      msg.rate = 1;
      msg.pitch = 1;
      synth.speak(msg);
    },

    /* 
        ** 语音停止
      */
      handleStop(e){
        msg.text = e;
        msg.lang = 'zh-CN';
        synth.cancel(msg);
      }
    }
  }
</script>
 
<style scoped lang='less'>
.modal{
  width: 100%;
  height: 100%; 
  background:rgba(0,0,0,1);
  opacity:0.3;
  position: fixed;
  top: 0;
  left: 0;
  margin: auto;
}
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
.item-box {
  font-size: 18px; 
  overflow: hidden;
}
.item{
  margin: 10px 0;
 /*  display: flex;
  display: -webkit-flex;
  flex-direction: row; */
}
.item textarea{
  width: 100%;
}
.single-img-list{
  display: flex;
  display: -webkit-flex;
  flex-direction: row; 
  justify-content: space-between;
  flex-wrap: wrap
}
.single-img-list li{
  width: 200px;
  margin: 10px;
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
  margin: 0 20px;
} 
.tipsModal{
  width: 300px;
  height: 500px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
}
.tipsHeader{
  height:10px;
  background:rgba(91,102,127,1);
}
.innerTop{
  width: 100%;
  height: 230px;
  background:rgba(198,209,223,1);
  overflow: hidden;
}
.innerTop .innerTopBg{
  width: 160px;
  height: 160px;
  padding-top: 10px;
  margin:35px auto; 
  background: url('../assets/index-tips.png');
}
.innerTop .innerTopBg img{
  width: 140px; 
  margin: auto;
  border-radius: 50%;
}
.innerBot{
  width: 100%;
  height:146px;
  font-size: 26px;
  text-align: center;
  color: #ffffff;
  position: relative;
  background:rgba(91,102,127,1);
  padding-top: 50px;
}
.innerBot img{
  position: absolute;
  top: -20px;
  left: 126px;
  width: 48px;
  height:48px;
  margin: auto ; 
}
.tipsFooter{
  font-size: 12px;
  padding: 10px;
  background: #ffffff;
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
