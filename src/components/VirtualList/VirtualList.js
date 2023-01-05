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

const VirtualList = props => {
  const { list } = props;
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
