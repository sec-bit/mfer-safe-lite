import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ReactComponent as Drag } from '@/assets/icons/dots-six-vertical.svg';
import { deepClone } from '@/utils/misc';
import styles from './table.module.css';
import { ITableBodyProps } from './Table.types';

const TableBody: React.FC<ITableBodyProps> = ({
  columns,
  dataSource,
  draggable,
  tableData,
  setTable
}) => {
  const [dragging, setDragging] = useState(false);
  const [data, setData] = useState(dataSource);
  const copyData = useRef<AnyLiteral[]>([]);
  const dragItem = useRef<number>(0);
  const dragOverItem = useRef<number>(0);

  useEffect(() => {
    setData(dataSource);
  }, [dataSource]);

  const dragStartHandler = useCallback(
    (event: React.DragEvent<HTMLTableRowElement>, index: number) => {
      event.dataTransfer.effectAllowed = 'move';
      dragItem.current = index;
      copyData.current = deepClone(data);
    },
    [data]
  );

  const dragEnterHandler = useCallback((index: number) => {
    dragOverItem.current = index;
    const newData = deepClone(copyData.current);
    const dragData = newData[dragItem.current];
    newData.splice(dragItem.current, 1);
    newData.splice(dragOverItem.current, 0, dragData);
    setData(newData);
  }, []);

  const dragOverHandler = useCallback(
    (event: React.DragEvent<HTMLTableRowElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      return false;
    },
    []
  );

  const dragEndHandler = useCallback(() => {
    const newData = deepClone(tableData || []);
    const dragData = newData[dragItem.current];
    newData.splice(dragItem.current, 1);
    newData.splice(dragOverItem.current, 0, dragData);
    setTable && setTable(newData);
    setDragging(false);
  }, [tableData, setTable]);

  const dropHandler = useCallback(
    (event: React.DragEvent<HTMLTableRowElement>) => {
      event.stopPropagation();
      event.preventDefault();
      return false;
    },
    []
  );

  return (
    <tbody className={styles.body}>
      {data.map((data, rowIndex) => {
        return (
          <tr
            className={styles.bodyRow}
            key={rowIndex}
            draggable={dragging}
            onDragStart={event => dragStartHandler(event, rowIndex)}
            onDragOver={dragOverHandler}
            onDragEnter={() => dragEnterHandler(rowIndex)}
            onDragEnd={dragEndHandler}
            onDrop={dropHandler}
          >
            {draggable && (
              <th className={styles.bodyCell}>
                <button
                  className={styles.drag}
                  onMouseDown={() => setDragging(true)}
                  onMouseUp={() => setDragging(false)}
                >
                  <Drag className={styles.dragIcon} />
                </button>
              </th>
            )}
            {columns.map(column => {
              if (column.render) {
                return (
                  <td className={styles.bodyCell} key={column.name}>
                    {column.render(data[column.name], data, rowIndex)}
                  </td>
                );
              } else {
                return (
                  <td className={styles.bodyCell} key={column.name}>
                    {data[column.name]}
                  </td>
                );
              }
            })}
          </tr>
        );
      })}
    </tbody>
  );
};

export default TableBody;
