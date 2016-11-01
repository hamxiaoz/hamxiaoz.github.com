--- 
tags: 
  - "The Code Book"

layout: post



title: "[转载]用C写个取暖器"

---
<div id="msgcns!5F971C000415D85F!229" class="bvMsg">转载]用C写个取暖器
强人就是不一样
原始连接: [url]http://blog.0x557.org/swan/archives/001720.html[/url]<br>作者：swan
<br>  冬天到了，叶子掉了，大雁们排成B字形或者T字形往南飞，程序员却还要在严寒中偎依着冰冷的电脑忧郁地玩着键盘。作为一个优秀的程序员，我们可以用程序解决除了老婆以外的所有问题，何况是小小的寒风呢。下面我们就用C来写一个取暖器。<br>  理论上的分析是，电脑是耗费电力的，这部分电除了发光发声以外，都用在发热上面了。简单说来，CPU，硬盘，乃至内存都会因为工作而发热。考虑到程序的通用性，我们不考虑显卡声卡光驱，我们用内存读写来让内存发热，用大量计算来使CPU发热，用文件读写来加热硬盘，最后可以让电脑成为一个小小的取暖器。<br>让CPU发热的代码如下：
DWORD WINAPI CPUHotter(PVOID para)<br>{<br>  while(1);<br>  return 1;<br>}
让内存发热的代码如下：
DWORD WINAPI MemHotter(PVOID para)<br>{<br>  char *Mem = new char[10000];<br>  while(1)<br>  {<br>        for(int i=0;i<10000;i++)<br>        {<br>              Mem[i] = 0x99;<br>        }<br>  }<br>  return 1;<br>}
最后是让硬盘发热的代码：
DWORD WINAPI DiskHotter(PVOID para)<br>{<br>FILE *fp;<br>fp = fopen("_", "a+");<br>  while(1)<br>  {<br>    for(int i=0;i<10000;i++)<br>    {<br>        fwrite("1", 1, 1, fp);<br>    }<br>    rewind(fp);<br>  }<br>  return 1;<br>}
main函数创建上面三个线程就可以了。本代码在Athlon 1.26 + 256M + VC 6.0的环境下编译并运行成功，Windows 2000下运行了三天，室内温度持续上升中，拟申请国家专利。受到开源思想的感化，特放出源代码，希望给各位带来一个温暖的冬天。<br>谢谢。
<div></div>
</div>
