# 使用Nginx作为基础镜像
FROM nginx:latest

# 将Vue.js项目文件复制到Nginx的默认静态文件目录
COPY  /dist /usr/share/nginx/html

# 复制自定义Nginx配置（如果有的话）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露Nginx的默认端口
EXPOSE 5176

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
