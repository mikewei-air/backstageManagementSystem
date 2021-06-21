<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-row>
        <!-- 角色列表 -->
        <el-table :data="roleList" border stripe>
          <!-- 展开列 -->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-row
                :class="['bdbottom', index_1 === 0 ? 'bdtop' : '', 'vcenter']"
                v-for="(item_1, index_1) in scope.row.children"
                :key="item_1.id"
              >
                <!-- 渲染一级权限 -->
                <el-col :span="5">
                  <el-tag closable
                        @close="removeRightById(scope.row, item_1.id)">{{ item_1.authName }}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 渲染二级和三级权限 -->
                <el-col :span="19">
                  <el-row
                    :class="[index_2 === 0 ? '' : 'bdtop', 'vcenter']"
                    v-for="(item_2, index_2) in item_1.children"
                    :key="item_2.id"
                  >
                    <el-col :span="6">
                      <el-tag type="success" closable
                        @close="removeRightById(scope.row, item_2.id)">{{ item_2.authName }}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag
                        v-for="item_3 in item_2.children"
                        :key="item_3.id"
                        type="warning"
                        closable
                        @close="removeRightById(scope.row, item_3.id)"
                        >{{ item_3.authName }}</el-tag
                      >
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作" width="300px">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini"
                >编辑</el-button
              >
              <el-button type="danger" icon="el-icon-delete" size="mini"
                >删除</el-button
              >
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)"
                >分配权限</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-row>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
  title="分配权限"
  :visible.sync="setRightDialogVisible"
  width="50%"
  @close="setRightDialogClosed"
>
  <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
  <template #footer>
    <span class="dialog-footer">
      <el-button @click="setRightDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="allotRights">确 定</el-button>
    </span>
  </template>
</el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      roleList: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      rightsList: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点id值数组
      defKeys: [],
      // 当前即将分配角色的id
      roleId: ''
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.roleList = res.data
      console.log(this.roleList)
    },
    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
      // 弹窗提示用户是否要删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消了删除')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败')
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('删除权限失败')
      // 把获取到的权限数据保存到data中
      this.rightsList = res.data
      this.setRightDialogVisible = true
      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      // 如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('更新权限失败')
      this.$message.success('更新权限成功')
      this.getRoleList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
