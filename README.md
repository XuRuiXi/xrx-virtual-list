### 2种方法实现虚拟列表  
![虚拟列表](https://pic2.zhimg.com/80/v2-21145cc94fd8d2064a1d15e489dc22f1_1440w.webp "虚拟列表")
（图片取至知乎）  
在我们滚动的过程中，只需要渲染可视区里面的元素即可。  

- 实现一（基于positiond定位）  
```html
<div class="root" style="position: relative">
  <div class="static" />
  <Item style="position: absolute; top: 0px" />
  <Item style="position: absolute; top: 50px" />
  <Item style="position: absolute; top: 10px" />
</div>
```
采用position定位的原理是滚动容器（.root）使用相对定位position: relative。每个元素相对父元素使用绝对定位position: absolute。距离top取决于子元素设置的高度，已经子元素的位置。  
而.static，则是占位的空元素，它的高度等于所有子元素高度的和。作用是生成滚动容器的滚动条。

**react版**  
首先上完整代码，然后再解析  
./PosiVirtualList.less
```less
.root{
  overflow-y: auto;
  width: 300px;
  margin: 0 auto;
  position: relative;
  .item{
    text-align: center;
    border-bottom: 1px solid #ccc;
    box-sizing: border-box;
    position: absolute;
    width: 100%;
  }
}
```
./index.js
```js
import React, { useState, useMemo } from 'react';
import styles from './PosiVirtualList.less';

// 滚动容器高度
const SCROLL_CONTAINER_HRIGHT = 500;
// 每个子元素高度
const ITEM_HEIGHT = 50;
// 可视区域的子元素数量
const VIEW_NUMBER = Math.ceil(SCROLL_CONTAINER_HRIGHT / ITEM_HEIGHT);
// 过渡子元素数量（缓冲区）
const BUFFER_NUMBER = 10;

// 列表数据
const list = Array(100).fill(1).map((_, idx) => ({ id: idx }));

const PosiVirtualList = () => {
  const total = list.length;
  const [start, setStart] = useState(0);
  const end = useMemo(() => start + VIEW_NUMBER + BUFFER_NUMBER, [start]);
  
  const scroll = e => {
    const scrollTop = e.target.scrollTop;
    const scrollNumber = Math.floor(scrollTop / ITEM_HEIGHT);
    setStart(scrollNumber);
  };

  return (
    <div
      className={styles.root}
      style={{ height: `${SCROLL_CONTAINER_HRIGHT}px` }}
      onScroll={scroll}
    >
      <div style={{ height: `${ITEM_HEIGHT * total}px` }} />
      {
        list.map((i, idx) => {
          if (start - BUFFER_NUMBER <= idx && end > idx) {
            return (
              <div
                key={idx}
                className={styles.item}
                style={{ height: `${ITEM_HEIGHT}px`, top: `${ITEM_HEIGHT * idx}px` }}
              >
                {i.id}
              </div>
            );
          }
          return false;
        })
      }
    </div>
  );
};

export default PosiVirtualList;
```

解析
```js
// 滚动容器高度
const SCROLL_CONTAINER_HRIGHT = 500;
// 每个子元素高度
const ITEM_HEIGHT = 50;
// 可视区域的子元素数量
const VIEW_NUMBER = Math.ceil(SCROLL_CONTAINER_HRIGHT / ITEM_HEIGHT);
// 过渡子元素数量（缓冲区）
const BUFFER_NUMBER = 10;
```

首先我们需要知道容器的高度、子元素的高度，计算得出可视区域的元素数量。  
如果我们只渲染可视区域的元素，那么当我们滚动的时候，会出现渲染跟不上导致页面上下出现空白的情况，所以我们还需要设置缓冲区子元素的渲染数量。  

```js
  const [start, setStart] = useState(0);
  const end = useMemo(() => start + VIEW_NUMBER + BUFFER_NUMBER, [start]);
  const scroll = e => {
    const scrollTop = e.target.scrollTop;
    const scrollNumber = Math.floor(scrollTop / ITEM_HEIGHT);
    setStart(scrollNumber);
  };
```
当容器滚动时，监听滚动事件，通过scrollTop，得到被卷起的高度，从而知道被卷起的子元素数量是多少。然后就设置start值（列表渲染的起始坐标）。  
然后end代表列表渲染的结束坐标，它包含起始坐标 + 可视区域元素数量 + 缓冲区元素数量。

```jsx
<div style={{ height: `${ITEM_HEIGHT * total}px` }} />
```
这个div就是占位元素，它的高度取决于列表数量和元素高度。然后生成滚动列表。

```js
{
  list.map((i, idx) => {
    if (start - BUFFER_NUMBER <= idx && end > idx) {
      return (
        <div
          key={idx}
          className={styles.item}
          style={{ height: `${ITEM_HEIGHT}px`, top: `${ITEM_HEIGHT * idx}px` }}
        >
          {i.id}
        </div>
      );
    }
    return false;
  })
}
```
这里也有一个需要注意的地方，那就是if (start - BUFFER_NUMBER <= idx && end > idx)这个判断条件。  
start - BUFFER_NUMBER是因为顶部也需要缓冲区。

综上可以看出，我们真实渲染的列表，其实是(start - BUFFER_NUMBER) ~ (start + VIEW_NUMBER + BUFFER_NUMBER)

- 实现二（滚动容器上下采用空白的占位元素）  
```html
<div class="root">
  <div class="staticTop" />
  <Item />
  <Item />
  <Item />
  <div class="staticBottom" />
</div>
```
通过动态计算staticTop和staticBottom的高度以及渲染可是区域的列表，实现虚拟滚动。  

首先上完整代码，然后解析  
./VirtualList.less
```less
.root{
  width: 300px;
  margin: 0 auto;
  overflow-y: auto;
  .item{
    text-align: center;
    border-bottom: 1px solid #ccc;
    box-sizing: border-box;
  }
}
```
./index.js
```js
import React, { useState, useMemo } from 'react';
import styles from './VirtualList.less';

// 滚动容器高度
const SCROLL_CONTAINER_HRIGHT = 500;
// 每个子元素高度
const ITEM_HEIGHT = 50;
// 可视区域的子元素数量
const VIEW_NUMBER = Math.ceil(SCROLL_CONTAINER_HRIGHT / ITEM_HEIGHT);
// 过渡子元素数量（缓冲区）
const BUFFER_NUMBER = 10;

// 列表数据
const list = Array(100).fill(1).map((_, idx) => ({ id: idx }));

const VirtualList = props => {
  const total = list.length;
  const [start, setStart] = useState(0);

  const end = useMemo(() => Math.min(start + VIEW_NUMBER + BUFFER_NUMBER, total), [start, total]);
  const renderStart = useMemo(() => Math.max(start - BUFFER_NUMBER, 0), [start]);

  const bufferTop = useMemo(() => renderStart * ITEM_HEIGHT, [renderStart]);
  const bufferBottom = useMemo(() => (total - end) * ITEM_HEIGHT, [total, end]);

  const scroll = e => {
    const scrollTop = e.target.scrollTop;
    const scrollNumber = Math.floor(scrollTop / ITEM_HEIGHT);
    setStart(scrollNumber);
  };

  return (
    <div
      className={styles.root}
      onScroll={scroll}
      style={{ height: `${SCROLL_CONTAINER_HRIGHT}px` }}
    >
      <div style={{ height: `${bufferTop}px` }} />
      <div className={styles.renderList}>
        {
          list.map((i, idx) => {
            if (renderStart <= idx && end > idx) {
              return(
                <div
                  key={i.id}
                  className={styles.item}
                  style={{ height: `${ITEM_HEIGHT}px` }}
                >
                  {i.id}
                </div>
              );
            }
            return false;
          })
        }
      </div>
      <div style={{ height: `${bufferBottom}px` }} />
    </div> 
  );
};

export default VirtualList;
```

```js
const [start, setStart] = useState(0);

const bufferTop = useMemo(() => renderStart * ITEM_HEIGHT, [renderStart]);
const bufferBottom = useMemo(() => (total - end) * ITEM_HEIGHT, [total, end]);

const end = useMemo(() => Math.min(start + VIEW_NUMBER + BUFFER_NUMBER, total), [start, total]);
const renderStart = useMemo(() => Math.max(start - BUFFER_NUMBER, 0), [start]);
```

虽然主体思想差不多，但这里涉及计算上、下的占位高度。bufferTop是根据渲染的起始坐标计算的，但是我们的上部分有缓冲区元素。这就导致的真实的渲染起始坐标并不是start，而是start-BUFFER_NUMBER。  
所以我们另外设置renderStart，来表示真实的渲染start。因为需要计算bufferTop，所以renderStart不能是负数。
```js
const renderStart = useMemo(() => Math.max(start - BUFFER_NUMBER, 0), [start]);
```
当滚动时，start + VIEW_NUMBER + BUFFER_NUMBER会出现大于total的情况，然后导致bufferBottom出现负数，然后设置负数的height并不会生效。结合快速滚动时，可能会跳过end === 0的情况，导致无法设置bufferBottom为0，所以会出现高度错乱的情况（bufferBottom滚动到底部时还是大于0）。所以我们限制end不能大于total。
```js
const end = useMemo(() => Math.min(start + VIEW_NUMBER + BUFFER_NUMBER, total), [start, total]);
```

### 再贴上原生js实现position的虚拟列表
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .root{
      width: 300px;
      margin: 0 auto;
      overflow-y: auto;
      position: relative;
    }
    .item{
      text-align: center;
      border-bottom: 1px solid #ccc;
      box-sizing: border-box;
      position: absolute;
      width: 100%;
    }
  </style>
</head>
<body>
  <div class="root">
    <div class="static"></div>
    <div id="content"></div>
  </div>
  <script>
    
    const urlSearchParams = new URLSearchParams(window.location.search);
    const data = JSON.parse(urlSearchParams.get('data'));
    const total = data.length;
    // 滚动容器高度
    const SCROLL_CONTAINER_HRIGHT = 520;
    // 每个子元素高度
    const ITEM_HEIGHT = 50;
    // 可视区域的子元素数量
    const VIEW_NUMBER = Math.ceil(SCROLL_CONTAINER_HRIGHT / ITEM_HEIGHT);
    // 过渡子元素数量（缓冲区）
    const BUFFER_NUMBER = 10;

    // 滚动容器
    const scrollDom = document.querySelector('.root');
    // 占位容器
    const staticDom = document.querySelector('.static');
    // 内容容器
    const content = document.querySelector('#content');

    let start = 0;
    let end = start + VIEW_NUMBER + BUFFER_NUMBER;

    scrollDom.style.height = `${SCROLL_CONTAINER_HRIGHT}px`;
    staticDom.style.height = `${total * ITEM_HEIGHT}px`;

    function render(startIndex, endIndex) {
      const renderList = data.map((i, idx) => {
        if (startIndex - BUFFER_NUMBER <= idx && endIndex > idx) {
          return i;
        }
        return false;
      });
      let template = '';
      for (let i = 0; i < renderList.length; i++) {
        if (renderList[i]) {
          let str = 
          `<div
            class="item"
            style="height: ${ITEM_HEIGHT}px; top: ${ITEM_HEIGHT * i}px"
          >
            ${renderList[i].id}
          </div>`;
          template = template.concat(str);
        }
      }
      content.innerHTML = template;
    }
    render(start, end);
    scrollDom.addEventListener('scroll', e => {
      const scrollTop = e.target.scrollTop;
      start = Math.floor(scrollTop / ITEM_HEIGHT);
      end = start + VIEW_NUMBER + BUFFER_NUMBER;
      render(start, end);
    });

  </script>
</body>
</html>
```

### 实现动态高度的虚拟列表（滚动到底部加载，类似刷微博的体验）  
为了实现动态加载数据，我们需要用node启动一个后端服务。随机生成10万条数据，根据接口的PageNum和pageSize，返回相应的数据。

```js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const port = 1111;
const LIST_SIZE = 100000;

const list = Array(LIST_SIZE).fill(1).map((_, i) => {
  const num = (Math.random() * 100).toFixed(0);
  return {
    content: Array(Number(num)).fill(i).join(''),
  };
});

app.use(bodyParser.json());

app.post('/getHi', (req, res) => {
  console.log(req.body);
  const { pageNum, pageSize = 10 } = req.body;
  const _list = list.filter((i, idx) => idx >= (pageNum - 1) * pageSize && idx < pageNum * pageSize);
  const response = {
    list: _list,
    total: list.length,
  }
  res.send(response);
})

const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

```

首先dom结构和我们虚拟列表的position方法类似。子元素我们也是采用position定位。不同的是多了\<CountDom />和\<BottomDiv />。  

\<CountDom />：为了获取dom的真实高度，接口获取到数据之后，我们把数据渲染到该区域，计算到真实高度之后，再把该区域的dom删除。  

\<BottomDiv />：显示提示信息的，例如滚动到底部显示"加载中..."等等。

```html
<div class="root" style="position: relative">
  <div class="static" />
  <Item style="position: absolute; top: 0px" />
  <Item style="position: absolute; top: 50px" />
  <Item style="position: absolute; top: 10px" />
  <CountDom />
  <BottomDiv />
</div>
```

**先讲下整体思路：**  

维护一个数组：topList，表示每个子元素距离父元素的top值：通过接口获取到数据之后，渲染临时dom到\<CountDom />，获取dom的真实高度。然后通过计算得到top。在渲染的时候，元素和topList一一对应。


先上整体代码，然后解析：  
./DynamicHeightVirtual.less
```less
.root{
  --bottomHeight: 50px;
  :global{
    .item{
      visibility: hidden;
      top: 0;
    }
  }

  font-family: YouSheBiaoTiHei;
  margin: 0 auto;
  overflow-y: auto;
  position: relative;
  .item{
    position: absolute;
    width: 100%;
    padding: 10px;
    text-align: center;
    word-break: break-all;
    border-bottom: 1px solid #ddd;
    text-align: center;
    box-sizing: border-box;
  }
  .bottom{
    height: var(--bottomHeight);
    text-align: center;
    line-height: var(--bottomHeight);
  }
}
```
./index.tsx
```ts
import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import styles from './DynamicHeightVirtual.less';

const PAGESIZE:number = 10;
// 缓冲地带的dom数量
const BUFFER_NUMBER:number = 10;
// 容器高度
const CONTAINER_HEIGHR:number = 500;

type listType = Array<{
  content: string;
}>

type BottomDivProps = React.HTMLAttributes<HTMLDivElement> & {
  end: boolean;
  list: listType;
}

type CountDomProps = React.HTMLAttributes<HTMLDivElement> & {
  current: number;
  list: listType;
}

const DynamicHeightVirtual = () => {
  // 总的列表数据
  const [list, setList] = useState<listType>([]);
  const [current, setCurrent] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  // 判断是否以及请求完所有数据
  const end = useMemo(() => list.length === total, [list, total]);
  // 滚动容器dom
  const dom = useRef<HTMLDivElement>();
  // 每个dom的position距离top的位置
  const [topList, setTopList] = useState<Array<number>>([0]);
  // 渲染起始位置
  const [renderStart, setRenderStart] = useState(0);

  const getPage = (num: number) => {
    setLoading(true);
    axios.post('/getHi', { pageNum: num, pageSize: PAGESIZE }).then(res => {
      setList([...list, ...res.data.list]);
      setTotal(res.data.total);
      setLoading(false);
      // 放在异步队列，获取更新之后的dom，然后计算的dom真实高度，维护一组高度的列表
      setTimeout(() => {
        const doms = [...dom.current.querySelectorAll('.item')] as Array<HTMLDivElement>;
        const heights = doms.map(i => {
          return i.offsetHeight;
        });
        
        const newTopList = [...topList];
        const topListLength = newTopList.length;
        for (let i = 0; i < heights.length; i++) {
          newTopList[topListLength + i] = newTopList[topListLength - 1 + i] + heights[i];
        }
        setTopList(newTopList);
        doms.forEach(i => i.remove());
      });
    });
  };
  
  const scroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const scrollTop = e.currentTarget.scrollTop;
    setRenderStart(topList.findIndex(i => i > scrollTop));
    const bottomDis = e.currentTarget.scrollHeight - scrollTop - e.currentTarget.offsetHeight;
    if (bottomDis < 50 && !loading && !end) {
      setCurrent(current + 1);
    }
  };

  const CountDom = useMemo(() => {
    return function _(props: CountDomProps) {
      const { current, list } = props;
      const start = (current - 1) * PAGESIZE;
      return (
        <div>
          {
            list.map((i, idx) =>{
              if (idx >= start) {
                return (
                  <div
                    key={idx}
                    className={`${styles.item} item`}
                  >
                    {i.content}
                  </div>
                );
              }
              return false;
            })
          }
        </div>
      );
    };
  }, [list, current]);

  const BottomDiv = (props: BottomDivProps) => {
    const { end } = props;
    if (list.length === 0) return <div className={styles.bottom}>暂无数据</div>;
    if (end) return <div className={styles.bottom}>到底啦~~~</div>;
    return <div className={styles.bottom}>加载中...</div>;
  };

  useEffect(() => {
    getPage(current);
  }, [current]);
  return (
    <div
      className={styles.root}
      style={{ height: `${CONTAINER_HEIGHR}px` }}
      onScroll={scroll}
      ref={dom}
    >
      <div style={{ height: `${topList[topList.length - 1]}px` }} />
      {
        list.map((i, idx) => {
          if (idx >= renderStart - BUFFER_NUMBER && idx < renderStart + 20) {
            return (
              <div
                key={idx}
                className={`${styles.item}`}
                style={{ top: topList[idx], visibility: topList[idx + 1] !== void(0) ? 'visible' : 'hidden' }}
              >
                {i.content}
              </div>
            );
          }
          return false;
        })
      }
      <CountDom list={list} current={current} />
      <BottomDiv end={end} list={list} />
    </div>
  );
};

export default DynamicHeightVirtual;

```


```ts
// 每页请求的数量
const PAGESIZE:number = 1000;
// 缓冲地带的dom数量
const BUFFER_NUMBER:number = 10;
// 容器高度
const CONTAINER_HEIGHR:number = 500;
```

先声明3个常量，意义见注释。

```ts
// 总的列表数据
  const [list, setList] = useState<listType>([]);
  // 当前的页数
  const [current, setCurrent] = useState<number>(1);
  // 是否正在请求数据
  const [loading, setLoading] = useState<boolean>(false);
  // 接口返回的total，表示总条数
  const [total, setTotal] = useState<number>(0);
  // 判断是否以及请求完所有数据
  const end = useMemo(() => list.length === total, [list, total]);
  // 滚动容器dom
  const dom = useRef<HTMLDivElement>();
  // 每个dom的position距离top的位置
  const [topList, setTopList] = useState<Array<number>>([0]);
  // 渲染起始位置
  const [renderStart, setRenderStart] = useState(0);
```
组件声明的一些变量，意义见注释。

```ts
  const getPage = (num: number) => {
    setLoading(true);
    axios.post('/getHi', { pageNum: num, pageSize: PAGESIZE }).then(res => {
      setList([...list, ...res.data.list]);
      setTotal(res.data.total);
      setLoading(false);
      // 放在异步队列，获取更新之后的dom，然后计算的dom真实高度，维护一组高度的列表
      setTimeout(() => {
        const doms = [...dom.current.querySelectorAll('.item')] as Array<HTMLDivElement>;
        const heights = doms.map(i => {
          return i.offsetHeight;
        });
        
        const newTopList = [...topList];
        const topListLength = newTopList.length;
        for (let i = 0; i < heights.length; i++) {
          newTopList[topListLength + i] = newTopList[topListLength - 1 + i] + heights[i];
        }
        setTopList(newTopList);
        doms.forEach(i => i.remove());
      });
    });
  };
```
这段请求函数，是核心代码。

1、在数据返回之后，我们保存数据到list
```js
setList([...list, ...res.data.list]);
```
2、此时我们看\<CountDom />
```jsx
const CountDom = useMemo(() => {
  return function _(props: CountDomProps) {
    const { current, list } = props;
    const start = (current - 1) * PAGESIZE;
    return (
      <div>
        {
          list.map((i, idx) =>{
            if (idx >= start) {
              return (
                <div
                  key={idx}
                  className={`${styles.item} item`}
                >
                  {i.content}
                </div>
              );
            }
            return false;
          })
        }
      </div>
    );
  };
}, [list, current]);
--------------------------------------------
<CountDom list={list} current={current} />
```

通过const start = (current - 1) * PAGESIZE。我们可以把最后一次请求回来的数据，渲染到\<CountDom />里面。

```ts
setTimeout(() => {
  const doms = [...dom.current.querySelectorAll('.item')] as Array<HTMLDivElement>;
  const heights = doms.map(i => {
    return i.offsetHeight;
  });
  
  const newTopList = [...topList];
  const topListLength = newTopList.length;
  for (let i = 0; i < heights.length; i++) {
    newTopList[topListLength + i] = newTopList[topListLength - 1 + i] + heights[i];
  }
  setTopList(newTopList);
  doms.forEach(i => i.remove());
});
```

放在setTimeout里面，是为了等待list渲染完毕，获取到dom。因为我们第一个元素的position必定是0，所有我们topList默认第一位是0：[0]，然后第二位才是我们累加的开始。第i位的值是 i-1 位的值加上height[i]。  
获取newTopList之后，
然后我们设置setTopList(newTopList)，然后把临时dom删除。（topList更新之后，元素就会定位到对应的位置）


**滚动事件**

```ts
const scroll: React.UIEventHandler<HTMLDivElement> = (e) => {
  const scrollTop = e.currentTarget.scrollTop;
  // 获取到起始渲染的下标。
  setRenderStart(topList.findIndex(i => i > scrollTop));
  // 距离底部的距离
  const bottomDis = e.currentTarget.scrollHeight - scrollTop - e.currentTarget.offsetHeight;
  // 设置条件，避免重复赋值
  if (bottomDis < 50 && !loading && !end) {
    setCurrent(current + 1);
  }
};
```


**再讲一些细节：**

```html
<div
  className={styles.root}
  style={{ height: `${CONTAINER_HEIGHR}px` }}
  onScroll={scroll}
  ref={dom}
>
  <div style={{ height: `${topList[topList.length - 1]}px` }} />
  {
    list.map((i, idx) => {
      if (idx >= renderStart - BUFFER_NUMBER && idx < renderStart + 20) {
        return (
          <div
            key={idx}
            className={`${styles.item}`}
            style={{ top: topList[idx], visibility: topList[idx + 1] !== void(0) ? 'visible' : 'hidden' }}
          >
            {i.content}
          </div>
        );
      }
      return false;
    })
  }
  <CountDom list={list} current={current} />
  <BottomDiv end={end} list={list} />
</div>
```

1、生成滚动条的占位元素，其高度是topList的最后一位。
2、因为一开始渲染接口数据的时候，其top数据还是空的，导致最新的元素会处在顶部。所以一开始我们把新的元素设置为hidden。当top数据出现时，才把它设置为visible。