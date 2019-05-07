## git本地操作
- 不停的创造文件进行备份，保证代码不丢失
- 记录历史提交git永不丢失，版本切换
- 团队协作，操作同一个文件，代码冲突，可以手动解决，也可以实现自动合并。
- git拥有强大的分支管理系统


## 分布式
- svn（集中式）、需要一台中央服务器
- git的区别，速度比svn快
- svn中每个文件夹都有一个.svn文件
- git有一个单独文件夹，.git文件夹
- git分为工作区、暂存区/过渡区、历史区/版本库

## linux
- pwd （print work directory）  当前文件夹
- rm -rf 文件夹名               删除文件夹
- rm 文件名                     删除文件
- makedir 文件夹名              创建文件夹
- cd 盘符：或者文件夹名         进入某个盘或文件夹
- cd..                          上级目录
- mv 文件(夹)名 要移的位置      移动文件夹到指定位置    
- ls -al                        显示目录所以文件
- touch 文件名                  创建文件
- cat 文件名                    查看文件内容
- vi 文件名 编辑文件 i进入编辑模式 esc退出编辑模式  :q! 不保存退出  :wq保存并退出
- echo hello > 1.txt            >表示输入  如果没有文件 会创建
- echo hello >> 1.txt           >>表示堆加

## 配置用户
```cmd
git config --list
git config --global user.name "***"
git config --global email "***@163.com"
```

## 初始化git
- 一个项目初始化一次，不能嵌套
```
git init 告诉git管理那个文件夹
git status 查看git状态 
```
## 添加到暂存区
```
git add .或-A或文件名 添加文件到暂存区
```

## 删除暂存区
```
/*当我们需要删除暂存区或分支上的文件, 同时工作区也不需要这个文件了, 可以使用*/
git rm .或文件路径 
/*当需要删除暂存区或分支上的文件, 但本地需要用, 但不希望这个文件被版本控制, 可以使用*/
git rm --cached .或文件路径 -r   
```

## 添加到历史区
```
git commit -m "备注"
git log 查看一下信息
git commit -a -m "备注" //跳过暂存区，直接提交，前提是对应文件被提交过一次
```

## 文件对比
```
// 工作区   暂存区   历史区
git diff                工作区和暂存区比
git diff --cached       暂存区和历史区比
git diff 分支名（表示是哪个分支的工作区和历史区比）
```

## 在当前暂存区时候可做的操作
```
git checkout .或者文件名    从暂存区中将工作区内容覆盖掉
git reset HEAD .            所有文件回到上个版本暂存区的样子，不改变工作区文件
```

## 强行回滚到某一个版本
```
git log     查看历史
git reset --hard 版本号
```

## 回滚之后，想回到将来某个版本
```
git reflog  查看所有版本号
git reset --hard 版本号
git reset --hard HEAD^ 回到上一个版本,修改的内容不保存
git reset --soft HEAD^ 回到上一个版本,修改的内容还会被保存
```

## 分支
```
git branch                  查看分支
git branch dev              创建分支
git checkout dev            切换分支
git branch -D dev           删除分支（不能删自己当前所在的分支）
git checkeout -b dev        创建并切换分支
```

## 文件有修改切换分支
```
git stash 暂存文件
git stash pop 还原暂存的内容
```
> 分支有更改不能直接切换，可以提交更改或者暂存更改，暂存使用过渡区覆盖工作区
> 在新建分支后，文件夹内容有变化且没提交时，这个更改不属于任何分支，什么时候提交了才被提交的分支

## 分支合并
```
/*master没有修改，dev分支合并到master*/
git merge dev  
git pull 远端名 分支名
```
> 遇到冲突时只能手动解决冲突，留下想要结果再次添加提交。

```
git log --graph -- online
```
## 本地 => github
- 现有git帐号
- readme.md
- .gitignore
- .gitkeep 保持空目录

## 关联git仓库
```
git remote add origin https://****.git
git remote -v
git remote rm 名字 删除关联
```

## 推送到github
```
git push origin master
```

## 拉取最新代码
- pull = git fetch + git merge
```
git pull origin master
```

## gh-pages分支来发布我们的静态页
- 在项目中创建一个gh-pages分支
- 将分支提到线上仓库
- 找到提供给你的网站 settings 
```
git checkout -b gh-pages
touch index.html
git add .
git commit -m "xxx"
git push origin gh-pages
```

## issue 问题
- 可以提交对项目的质疑

## 更改别人代码
- fork是在当前目录下克隆了一份，如果代码更新，不会随之更新

## 拉取本地
```
git clone 项目地址 项目别名
```
> 默认就是git仓库而且还有origin地址，可以将代码提交到自己仓库上
> 只有fork关系才能发送 pull request请求
