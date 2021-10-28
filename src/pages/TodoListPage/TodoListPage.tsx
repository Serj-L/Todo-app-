import React, { FC, useState, useEffect, SyntheticEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { RootState } from '../../store/index';
import { addTodo, deleteTodo, deleteCompletedTodo, editTodo, toggleTodoComplete, setTodosErrMsg, setTodosSortOrder, setTodosSortOrderToDbThunk } from '../../store/todosSlice';
import { ActionsWithTodos } from '../../types/types';
import { AddTodoForm, TodoList, Modal, Loader } from '../../components/index';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';

import styles from './TodoListPage.module.css';

interface TodoListPageProps {}

const TodoListPage: FC<TodoListPageProps> = () => {
  const [todoTitle, setTodoTitle] = useState<string>('');
  const [isModalActive, setIsModalActive] = useState<boolean>(false);
  const [actionTodoType, setActionTodoType] = useState<string>('');
  const [actionTodoTitle, setActionTodoTitle] = useState<string>('');
  const [actionTodoId, setActionTodoId] = useState<string>('');
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth > 375 ? false : true);
  const { userId } = useAppSelector((state: RootState) => state.user);
  const { todoList, isLoading, isError, updateDb, sortOrder } = useAppSelector((state: RootState) => state.todos);
  const reduxDispatch = useAppDispatch();

  const onTitleChange = (value: string) => setTodoTitle(value);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (todoList.find(todo => todo.title.toLowerCase() === todoTitle.trim().toLowerCase() && !todo.isCompleted)) {
      reduxDispatch(setTodosErrMsg({ todosErrMsg: 'Todo with same title is already exist!' }));
      return;
    }

    reduxDispatch(addTodo({
      id: uuidv4(),
      title: todoTitle.trim(),
      isCompleted: false,
    }));

    if (!isError) {
      setTodoTitle('');
    }
  };
  const toggleCheckBoxHandler = (todoId: string) => {
    reduxDispatch(toggleTodoComplete({ todoId }));
  };
  const sortBtnHandler = (sortOrder: string) => {
    reduxDispatch(setTodosSortOrder({ sortOrder }));
    reduxDispatch(setTodosSortOrderToDbThunk({ userId, sortOrder }));
  };
  const closeModalHandler = () => {
    setIsModalActive(false);
  };
  const deleteBtnHandler = (todoId: string, todoTitle: string) => {
    setActionTodoType(ActionsWithTodos.DELETE);
    setActionTodoTitle(todoTitle);
    setActionTodoId(todoId);
    setIsModalActive(true);
  };
  const clrCompletedBtnHandler = () => {
    setActionTodoType(ActionsWithTodos.CLRCOMPLETED);
    setIsModalActive(true);
  };
  const editTodoHandler = (todoId: string, todoTitle: string) => {
    setActionTodoType(ActionsWithTodos.EDIT);
    setActionTodoTitle(todoTitle);
    setActionTodoId(todoId);
    setIsModalActive(true);
  };
  const acceptBtnHandler = (e: SyntheticEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    if (actionTodoType === ActionsWithTodos.DELETE) {
      reduxDispatch(deleteTodo({ todoId: actionTodoId }));
      setActionTodoTitle('');
      setActionTodoId('');
    }
    if (actionTodoType === ActionsWithTodos.CLRCOMPLETED) {
      reduxDispatch(deleteCompletedTodo());
    }
    if (actionTodoType === ActionsWithTodos.EDIT) {
      if (todoList.find(todo => todo.title.toLowerCase() === actionTodoTitle.trim().toLowerCase() && !todo.isCompleted)) {
        reduxDispatch(setTodosErrMsg({ todosErrMsg: 'Todo with same title is already exist!' }));
        return;
      }
      reduxDispatch(editTodo({ todoId: actionTodoId, todoTitle: actionTodoTitle.trim() }));
      setActionTodoTitle('');
      setActionTodoId('');
    }
    setActionTodoType('');
    setIsModalActive(false);
  };
  const rejectBtnHandler = (e: SyntheticEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    setActionTodoType('');
    setActionTodoTitle('');
    setActionTodoId('');
    setIsModalActive(false);
  };

  useEffect(() => {
    const screenResizeHandler = () => {
      if (window.innerWidth > 768) {
        setIsMobile(false);
      } else {
        setIsMobile(true);
      }
    };

    window.addEventListener('resize', screenResizeHandler);

    return () => window.removeEventListener('resize', screenResizeHandler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.wrapper}>
      <AddTodoForm
        onSubmit = {onSubmit}
        onTitleChange = {onTitleChange}
        todoTitle = {todoTitle}
      />

      {isLoading && !updateDb ?
        <div className={styles.loaderWrapper}>
          <Loader />
        </div>
        :
        todoList.length
          ?
          <TodoList
            todos = {todoList}
            todosSortOrder = {sortOrder}
            isMobile = {isMobile}
            toggleCheckBoxHandler = {toggleCheckBoxHandler}
            deleteBtnHandler = {deleteBtnHandler}
            sortBtnHandler = {sortBtnHandler}
            clrCompletedBtnHandler = {clrCompletedBtnHandler}
            editTodoHandler = {editTodoHandler}
          />
          :
          isError
            ?
            <h3 className={styles.infoTitle}>Error loading Todos from cloud store!</h3>
            :
            <h3 className={styles.infoTitle}>You have no Todos yet, add it...</h3>
      }
      <Modal
        isModalActive = {isModalActive}
        closeModalHandler = {closeModalHandler}
        modalTitle = {`${actionTodoType} ${actionTodoType === ActionsWithTodos.CLRCOMPLETED ? 'Todos' : 'Todo'}`}
      >
        <>
          <div className={styles.modalTodoContent}>
            {
              actionTodoType === ActionsWithTodos.EDIT
                ?
                <label className={styles.modalInputLabel}>Todo title:
                  <input
                    className={styles.modalInput}
                    type="text"
                    value = {actionTodoTitle}
                    onChange = {(e) => setActionTodoTitle(e.target.value)}
                    placeholder='Enter a new Todo title...'
                  />
                </label>
                :
                actionTodoType === ActionsWithTodos.DELETE
                  ?
                  `Delete Todo: "${actionTodoTitle}" from Todos list ?`
                  :
                  'Delete all completed Todos from Todos list ?'
            }
          </div>
          <div className={styles.modalBtnWrapper}>
            <button
              className={styles.btn}
              disabled={!actionTodoTitle && actionTodoType !== ActionsWithTodos.CLRCOMPLETED ? true : false}
              onClick = {(e) => acceptBtnHandler(e)}
            >
              {actionTodoType === ActionsWithTodos.EDIT ? 'Save' : 'Delete'}
            </button>
            <button
              className={styles.btn}
              onClick = {(e) =>rejectBtnHandler(e)}
            >
            Cancel
            </button>
          </div>
        </>
      </Modal>
    </div>
  );
};

export default TodoListPage;
