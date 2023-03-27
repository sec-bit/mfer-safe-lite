import React from 'react';
import cls from 'clsx';
import styles from './textarea.module.css';

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  className = '',
  rows = 2,
  ...rest
}) => {
  return (
    <textarea
      className={cls(styles.textarea, className)}
      rows={rows}
      {...rest}
    ></textarea>
  );
};

export default Textarea;
