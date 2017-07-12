## 用友镜像初探

* 保证现有用户的操作习惯，所以要改造`npminstall`输入方式为"yon install"

* 增加ip识别，确保自动切换不同镜像

* 实现命令

  ```
  // 安装命令
  yon install gulp --save
  yon install gulp -S
  yon install gulp --global
  yon install gulp -G
  yon install gulp --save-dev
  yon install gulp -D

  // 版本
  yon --version
  yon -v

  // help
  yon --help
  yon -h

  // 默认
  yon install
  ```




## 已完成内容

* 完成版本识别

  ```
  yon --version
  yon -v
  ```

* 完成帮助

  ```
  yon
  yon -h
  yon --help
  ```

* 实现了`cnpm`与`npm`镜像的切换，但是用友的镜像存在以下问题：

  * 请求最新版本`latest`时，获取页面为404
  * 请求范围版本号(`>=1.2.0 <=2.0.0`)时，获取页面为404
  * 镜像采用了nexus oss管理：优点可以做代理，保证只需下载一份，缺陷如上
  * 使用了`npminstall`作为依赖，阿里做了处理，以致出现以上情况
  * 故准备在`relase`分支发布折中版本：
    * 使用`yon install`包装命令
    * 创建文件，写入是否能ping通内网地址及可选镜像地址
    * 读取文件，更改镜像