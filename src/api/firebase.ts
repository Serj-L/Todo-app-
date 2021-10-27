import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import { IUserLoginInput, IFirebaseLoginResponse, ITodoListSetToDb, ITodosSortOrderSetToDb, TodosSortOrder } from '../types/types';

export const firebaseApp = initializeApp({
  apiKey: 'AIzaSyDGmhjDViXDcauYtXU6H7BJkmGekgJCfcg',
  authDomain: 'todo-list-app-bb89a.firebaseapp.com',
  projectId: 'todo-list-app-bb89a',
  storageBucket: 'todo-list-app-bb89a.appspot.com',
  messagingSenderId: '958201388501',
  appId: '1:958201388501:web:a3538848f5df0a77bcb15c',
});

export const dataBase = getFirestore();

export const auth = getAuth();

setPersistence(auth, browserLocalPersistence);

export const userAuth = async (data: IUserLoginInput): Promise<IFirebaseLoginResponse> => {
  const { user } = data.isSignedForm ?
    await createUserWithEmailAndPassword(auth, data.userEmail, data.password) :
    await signInWithEmailAndPassword(auth, data.userEmail, data.password);

  if (data.isSignedForm) {
    setTodosSortOrderToDb({ userId: user.uid, todosSortOrder: TodosSortOrder.ALL });
  }

  return { uid: user.uid };
};

export const saveTodosToDb = async (todos: ITodoListSetToDb) => {
  await setDoc(doc(dataBase, 'users', todos.userId, 'todos', 'todoList'), { todoList: todos.todoList } );
};

export const getTodosFromDb = async (userId: string) => {
  const todos = await getDoc(doc(dataBase, 'users', userId, 'todos', 'todoList'));
  return todos.data();
};

export const setTodosSortOrderToDb = async (sortOrder: ITodosSortOrderSetToDb) => {
  await setDoc(doc(dataBase, 'users', sortOrder.userId, 'todos', 'todoSortOrder'), { todoSortOrder: sortOrder.todosSortOrder });
};

export const getTodosSortOrderFromDb = async (userId: string) => {
  const sortOrder = await getDoc(doc(dataBase, 'users', userId, 'todos', 'todoSortOrder'));
  return sortOrder.data();
};
