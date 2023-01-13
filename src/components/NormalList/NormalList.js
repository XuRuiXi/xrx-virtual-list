import React from 'react';
import styles from './NormalList.less';

const NormalList = props => {
  const { list } = props;

  return (
    <div className={styles.root}>
      {
        list.map((i) => (<div
          key={i.id}
          className={styles.item}
        >
          {i.id}
        </div>))
      }
    </div>
  );
};

export default NormalList;
