import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { Header } from 'react-native-elements';
import Button from 'react-native-elements/dist/buttons/Button';
import { v4 as uuid } from 'uuid';

const primaryColor = '#02A35B';

const styles = StyleSheet.create({
  header: {
    backgroundColor: primaryColor,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
  },
  container: {
    flex: 1,
    paddingTop: Platform.select({
      ios: 44,
      default: 27,
    })
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  checkbox: {
    width: 32,
  },
  input: {
    flex: 1,
    fontSize: 18,
    height: 40,
  },
  inputDone: {
    color: '#aaa',
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  draggableButton: {
    alignItems: 'center',
    width: 50,
    paddingTop: 8,
    marginRight: 10,
  },
  addButton: {
    color: primaryColor,
  }
});

type TodoItem = {
  id: string,
  text: string,
  done: boolean,
}

type StorageData = {
  items: TodoItem[],
}

const storeData = async (data: StorageData) => {
  try {
    const jsonValue = JSON.stringify(data)
    await AsyncStorage.setItem('@data', jsonValue)
  } catch (e) {
    // saving error
  }
}

const getData = async () => {
  try {
    const value = await AsyncStorage.getItem('@data')
    if(value !== null) {
      return JSON.parse(value) as StorageData;
    }
  } catch(e) {
    // error reading value
  }
}


const defaultItems = [
  { id: uuid(), text: '環境構築', done: true },
  { id: uuid(), text: 'Hello World', done: true },
  { id: uuid(), text: 'Todoアプリを作ってみる', done: false },
];

export default function App() {
  const [items, setItems] = useState<TodoItem[]>(defaultItems);

  useEffect(() => {
    getData().then((data) => {
      if (data) {
        // setItems(data.items);
      }
    })
  }, []);

  const updateItems = (newItems: TodoItem[]) => {
    setItems(newItems);
    storeData({items: newItems});
  };

  const handleChangeDone = (item: TodoItem) => {
    const target = items.find(i => i.id === item.id);
    if (!target) {
      return;
    }
    target.done = !target.done;
    updateItems([...items]);
  };

  const removeItem = (item: TodoItem) => {
    const newItems = items.filter(i => i.id !== item.id);
    updateItems(newItems);
  };

  const handleChangeText = (item: TodoItem, text: string) => {
    item.text = text;
    updateItems([...items]);
  };

  const handleBlur = (item: TodoItem) => {
    if (!item.text) {
      removeItem(item);
    }
  };

  const handleAdd = () => {
    updateItems([...items, { id: uuid(), text: '', done: false }]);
  };

  const handleRemoveDoneItems = () => {
    const newItems = items.filter(i => !i.done && i.text);
    updateItems(newItems);
  };

  const renderItem = useCallback(
    ({ item, index, drag, isActive }: RenderItemParams<TodoItem>) => {
      return (
        <View
          style={{ ...styles.itemContainer, backgroundColor: isActive ? primaryColor : 'white' }}
        >
          <TouchableOpacity onPress={() => handleChangeDone(item)} style={styles.checkbox}>
            <Ionicons name={item.done ? 'checkbox-outline' : 'square-outline'} size={32} />
          </TouchableOpacity>
          <TextInput
            style={item.done ? { ...styles.input, ...styles.inputDone } : styles.input}
            onChangeText={text => handleChangeText(item, text)}
            onBlur={() => handleBlur(item)}
            value={item.text}
            editable={!item.done}
          />
          <TouchableOpacity
            style={styles.draggableButton}
            onLongPress={drag}
          >
            <Ionicons name="menu-outline" size={32} color="black" />
          </TouchableOpacity>
        </View>
      );
    },
    [items]
  );

  return (
    <View style={styles.container}>
      <Header
        placement="left"
        containerStyle={styles.header}
        centerComponent={{ text: 'Simple Todo', style: styles.headerText }}
        rightComponent={{ type: 'font-awesome', icon: 'trash-o', color: '#fff', onPress: handleRemoveDoneItems }}
      />
      <DraggableFlatList
        style={styles.list}
        data={items}
        keyExtractor={(item, index) => item.id}
        renderItem={renderItem}
        onDragEnd={(data) => updateItems(data.data)}
        ListFooterComponent={
          <Button
            onPress={handleAdd}
            type="clear"
            titleStyle={styles.addButton}
            icon={
              <Ionicons name="add-outline" size={32} color={primaryColor} />
            }
            title="Add"
          />
        }
      />
    </View>
  );
}
