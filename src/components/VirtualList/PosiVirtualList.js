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

const PosiVirtualList = props => {
  const { list = [] } = props;
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
