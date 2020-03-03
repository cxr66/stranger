<template>
  <div class="index"  v-loading="loading">
      <p class="title">
          陌生人管理系统
          <span class="loginOut" @click="loginout()">退出系统</span>
      </p>
        <!-- 筛选条件 -->
      <div class="search">  
        <el-button type="primary" @click="handleCurrentPageChange(1,pagesize)" size="mini">刷新</el-button> 
        <el-button type="primary" @click=" addVisible = true " size="mini">新增</el-button> 
        <el-button type="primary" @click=" sync_face()" size="mini">同步至云端</el-button> 
        <el-button class="fr" type="primary" @click="navigate('/index')" size="mini">返回</el-button> 
      </div>
      <!-- 列表清单部分 -->
      <div class="table">
        <table>
          <thead>
            <tr>
              <th>序 号</th>
              <th>酒店</th>
              <th>姓名</th>
              <th>员工ID</th>
              <th>员工图像</th>
              <th>员工图像质量</th>
              <th>操作/状态</th> 
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item,index) in perList" :key="index" >
              <td>{{ index+1 }}</td>
              <td>{{ item.ht_hotel_name  }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.id_card_num }}</td>
              <td>
                  <img v-preview=" item.head_img_id " class="td-img" v-lazy=" item.head_img_id " alt="" preview-title-enable="true" preview-nav-enable="true" >   
              </td>
              <td> <i v-if=' item.head_img_quality == 1 '> 图像合格 </i>  <i v-else-if='item.head_img_quality > 1 '> 图像不合格，建议重新上传</i> <i v-else> 图像分析中 </i></td>
            
              <td class="font_bold" @click="deleteP(item.id)"> <span  style="color: #ff0000;" class="underline" >删除 <i class="radius bg_red"></i> </span> </td>
            </tr>
          </tbody>
        </table>
        <p v-if="total==0" style="padding: 20px 0;text-align:center;">当前暂无数据</p>
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
        ** 新增员工信息
      -->
      <el-dialog title="新增员工" :visible.sync="addVisible" width="30%" :before-close="handleClose">
        <div class="item-box ">
            <!-- 用户头像上传 -->
            <div class="userAvatar">
                <el-upload class="avatar-uploader text_center" action="https://oss.crowncrystalhotel.com/resource/employee/upload" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                    <img v-if="form.userAvatar" v-lazy="form.userAvatar" class="avatar">
                    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
            </div>
            <div class="item">
                <p>姓名：</p>
                <el-input v-model="form.name" placeholder="请输入姓名" size="mini"></el-input>
            </div>
            <div class="item">
                <p>员工ID：</p>
                <el-input v-model="form.id_card" placeholder="请输入员工ID" size="mini"></el-input>
            </div>
            <div style="margin: 20px 0;">
                <el-button class="fr" type="primary" @click="addPer()" size="mini">确认</el-button> 
            </div>
        </div>
    </el-dialog>

  </div>
</template>

<script> 
export default {
  name: 'index',
  data () {
    return {
        /* 分页 */
        currentPage: 1,
        pagesize: 10,
        total: 0,
        perList: [],

        /* 是否显示loading */
        loading: true,

        /* 弹窗是否提示 */
        tipsVisible: false,
        /* 新增弹窗是否显示 */
        addVisible: false,
        /* 表单提交数据 */
        form: {
            "userAvatar": null,
            "name": null,
            "id_card": null,
            "head_img_id": null,
            
        },

        /* 添加人脸错误字典 */
        addErrorDict:{
          3:  'json格式解析失败',
          6: 'base64解码失败',
          7: '缩放后的人脸图片编码base64失败',
          10001: '加载图片失败',
          10002: '分配内存失败',
          10003: '图片太大',
          10007: '人脸多于1个',
          10008: '没检测到人脸',
          10009: '人脸小于112*96',
          10011: '人脸质量不佳',
        }

    }
  },
  created(){
    let that = this;
    that.hotelInfo = JSON.parse(localStorage.getItem('hotelInfo'));
    // console.log(that.hotelInfo);
    this.handleCurrentPageChange(that.currentPage,that.pagesize);

  },
  destroyed: function() {
      
  },
  methods:{
    loginout(){
      //logout
      let that = this;
      this.$confirm('确认退出吗?', '提示', {
        confirmButtonClass: 'el-button--warning'
      }).then(() => { 
        that.$router.push({ path: '/' });
      }).catch(() => {

      });
    },
    /* 
      ** 跳转函数 **
    */
    navigate(path){
      this.$router.push({ path: path });
    },
    handleClose(done) {
        this.addVisible = false;
    }, 
    /* 
      **分页 **
    */
    handleCurrentPageChange(currentPage,page_size) {
        let that = this, url = this.$api.api_duty + "security/resident/list";
        that.loading = true
        that.$axios({
          method: "get",
          url: url,
          params: {
            page_num: currentPage,
            page_size:page_size, 
            source: 1
          }
        }).then(function(res) {
          // console.log(res.data.data);
          if(res.data.message == 'success'){ 
            for (let i in res.data.data.list){
              if(res.data.data.list[i].head_img_id){
                res.data.data.list[i].head_img_id = that.$api.api_img + res.data.data.list[i].head_img_id
              }
            }
            that.perList = res.data.data.list;
            that.total = res.data.data.total_count;

          }else if(res.data.data.message === 'authorization invalid' && res.data.data.message === 'fail'){

            that.$router.push({ path: '/login' });
            that.$message.error('获取数据失败，失败原因：' + res.data.message);

          }else{ 

            that.$router.push({ path: '/login' });
            that.$message.error('获取数据失败，失败原因：' + res.data.message);
          }

          that.loading = false;
        }).catch(function(err) {
            // console.info(err);
            that.loading = false;
        });
    },
    /* 删除员工信息 */
    /* addPer(){
        let that = this, url = this.$api.api_duty + 'security/resident/add' ;

        if(that.form.name && that.form.id_card && that.form.userAvatar){
            that.$axios.post(url,{
                "hotel_id": that.hotelInfo.hotel_id,
                "name":that.form.name,
                "id_card_num": that.form.id_card,
                "head_img_id": that.form.head_img_id,
                "source": 1
            }).then(function(res) {
                if(res.data.message == 'success'){ 
                    that.addVisible = false;
                    that.form = {
                        "userAvatar": null,
                        "name": null,
                        "id_card": null,
                        "head_img_id": null
                    }
                    that.handleCurrentPageChange(1,that.pagesize);
                }else{
                    that.$message.error('删除失败，失败原因：' + res.data.message);
                }
            }).catch(function(err) {
                console.info(err);
            });
        }
    }, */

    addPer(){
        let that = this, url = this.$api.api_duty + 'camera/server/add_face' ;

        if(that.form.name && that.form.id_card && that.form.userAvatar){
            that.$axios.post(url,{
                "name":that.form.name,
                "id_card_num": that.form.id_card,
                "jpg_file": that.form.head_img_id,
                "source": 1
            }).then(function(res) {
                if(res.data.message == 'success'){ 
                    that.addVisible = false;
                    that.form = {
                        "userAvatar": null,
                        "name": null,
                        "id_card": null,
                        "head_img_id": null
                    }
                    that.handleCurrentPageChange(1,that.pagesize);
                    that.$message({
                      message: '添加成功',
                      type: 'success'
                    }); 
                }else{
                  
                    that.$message.error('添加失败，失败原因：' + that.addErrorDict[res.data.data[0].result]);
                }
            }).catch(function(err) {
                console.info(err);
            });
        }
    },

    /* 同步人脸数据 */
    sync_face(){
      let that = this, url = this.$api.api_duty + 'camera/server/sync_person';
      that.$axios.post(url).then(function(res) {
        if(res.data.message == 'success'){ 
         that.$message({
            message: '同步至云端成功',
            type: 'success'
          }); 
        }else{ that.$message.error('同步至云端失败：' + res.data.message);  }
      }).catch(function(err) {
        console.info(err);
      });
                
    },
    /* 删除员工信息 */
    deleteP(id){
        let that = this, url = this.$api.api_duty + 'security/resident/delete/' + id;

        that.$confirm('确认删除该员工信息？')
          .then(_ => {
            that.$axios.post(url).then(function(res) {
                if(res.data.message == 'success'){ 

                    that.$axios.post(that.$api.api_duty +"camera/server/delete_face/" + id).then(function(res) {
                        if(res.data.message == 'success'){ 
                            that.handleCurrentPageChange(that.currentPage,that.pagesize);
                            
                        }else{
                            that.$message.error('删除云端失败，失败原因：' + res.data.message);
                        }
                    }).catch(function(err) {
                        console.info(err);
                    });
                }else{
                    that.$message.error('删除失败，失败原因：' + res.data.message);
                }
            }).catch(function(err) {
                console.info(err);
            });
          })
          .catch(_ => {

          });
        
    },
      /* 
      ** 上传图片
    */
    handleAvatarSuccess(res, file) {
        this.loading = false;
        if(res.message == 'success'){ 
            this.form.userAvatar = res.complete;
            this.form.head_img_id = res.url
        }else{
          this.$message.error("图片上传失败" ); 
        }
    },
    beforeAvatarUpload(file) {
        const isJPG = file.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < 2;

        /* if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 格式!');
        } */
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!');
        }
        this.loading = true;
        return isLt2M;
        // return isJPG && isLt2M;
    },

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

.search {
  width: 96%; 
  overflow: hidden;
  margin: 16px auto;
  font-size: 18px;
  font-weight: bolder;
}
.add_per{
  color: #46A0FC;
  font-size: 16px;
  cursor: pointer;
}  
.item-box {
  font-size: 18px; 
  overflow: hidden;
}
.userAvatar{
  width: 80px;
  height: 80px;
  margin: 10px  auto;
}
.avatar-uploader {
  width: 80px;
  height: 80px;
  padding: 20px;
  border: 1px dashed #f2f2f2;
  background: rgba(24, 24, 24, .2);
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: block;
  text-align: center;
}
.avatar-uploader:hover {
    border-color: #409EFF;
}
.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100%;
    height: 100%;  
}
.item{
    display: flex;
    flex-direction: row;
    margin: 20px 0;
}
.item p{
    width: 25%;
    font-size: 16px;
    text-align: right;
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
