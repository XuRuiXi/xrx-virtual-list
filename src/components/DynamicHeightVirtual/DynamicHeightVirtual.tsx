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
