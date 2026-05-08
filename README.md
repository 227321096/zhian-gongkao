# 知岸公考手机预览说明

这是一个可添加到手机主屏幕的 PWA 原型。

## 本机预览

电脑浏览器打开：

```text
http://localhost:9010/
```

## 手机预览

1. 让手机和电脑连接同一个 Wi-Fi。
2. 在电脑 PowerShell 里查看局域网 IP：

```powershell
ipconfig
```

3. 找到当前 Wi-Fi 网卡下的 `IPv4 地址`，例如 `192.168.1.8`。
4. 手机浏览器打开：

```text
http://192.168.1.8:9010/
```

把 `192.168.1.8` 换成你的电脑 IP。

## 添加到主屏幕

iPhone：

1. 用 Safari 打开手机预览地址。
2. 点击分享按钮。
3. 选择 `添加到主屏幕`。
4. 名称可填 `知岸公考`。

安卓：

1. 用 Chrome 打开手机预览地址。
2. 点击右上角菜单。
3. 选择 `添加到主屏幕` 或 `安装应用`。

## 注意

如果使用的是电脑本地地址，电脑必须保持开机，且本地服务需要继续运行。想要离开电脑也能访问，需要部署到 Vercel、Netlify、GitHub Pages 等静态托管平台。

## GitHub Pages 托管

这个项目是纯静态 PWA，可以直接托管到 GitHub Pages。

1. 在 GitHub 新建一个空仓库，例如 `zhian-gongkao`。
2. 在本地项目目录运行：

```powershell
git remote add origin https://github.com/你的用户名/zhian-gongkao.git
git branch -M main
git push -u origin main
```

3. 进入 GitHub 仓库的 `Settings` -> `Pages`。
4. `Build and deployment` 选择 `Deploy from a branch`。
5. Branch 选择 `main`，目录选择 `/root`，保存。

稍等片刻后，GitHub 会生成一个网址：

```text
https://你的用户名.github.io/zhian-gongkao/
```

用手机 Safari 或 Chrome 打开这个地址，就可以添加到主屏幕。
