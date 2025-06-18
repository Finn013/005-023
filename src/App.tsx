import React, { useState, useRef, useEffect } from 'react';
import { TabsContainer } from './components/TabsContainer';
import { RibbonMenu } from './components/RibbonMenu';
import { Note } from './types';

// Компонент для красивого диалогового окна
const Dialog = ({ isOpen, onClose, title, children }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Компонент для ввода данных в диалоге
const InputDialog = ({ isOpen, onClose, title, fields, onSubmit }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: { label: string; defaultValue: string; key: string }[];
  onSubmit: (values: Record<string, string>) => void;
}) => {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const initialValues: Record<string, string> = {};
      fields.forEach(field => {
        initialValues[field.key] = field.defaultValue;
      });
      setValues(initialValues);
    }
  }, [isOpen, fields]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type="text"
              value={values[field.key] || ''}
              onChange={(e) => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </form>
    </Dialog>
  );
};

// Контекстное меню для таблиц
const TableContextMenu = ({ isOpen, position, onClose, onAction }: {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onAction: (action: string) => void;
}) => {
  if (!isOpen) return null;

  const menuItems = [
    { label: 'Добавить строку выше', action: 'addRowAbove' },
    { label: 'Добавить строку ниже', action: 'addRowBelow' },
    { label: 'Удалить строку', action: 'deleteRow' },
    { label: 'Добавить столбец слева', action: 'addColumnLeft' },
    { label: 'Добавить столбец справа', action: 'addColumnRight' },
    { label: 'Удалить столбец', action: 'deleteColumn' },
  ];

  return (
    <div
      className="fixed bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50"
      style={{ left: position.x, top: position.y }}
    >
      {menuItems.map(item => (
        <button
          key={item.action}
          onClick={() => {
            onAction(item.action);
            onClose();
          }}
          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

function App() {
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', title: 'Новый документ', content: '' }
  ]);
  const [currentNoteId, setCurrentNoteId] = useState<string>('1');
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Добавляем ref для текущего содержимого редактора
  const currentContentRef = useRef<string>('');

  // Состояния для диалогов
  const [tableDialog, setTableDialog] = useState(false);
  const [linkDialog, setLinkDialog] = useState(false);
  const [imageDialog, setImageDialog] = useState(false);
  
  // Состояние для контекстного меню таблиц
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    targetCell: null as HTMLTableCellElement | null
  });

  // Загрузка заметок из localStorage при первом рендере
  useEffect(() => {
    const savedNotes = localStorage.getItem('textEditorNotes');
    const savedCurrentNoteId = localStorage.getItem('textEditorCurrentNoteId');
    
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
          setNotes(parsedNotes);
          if (savedCurrentNoteId && parsedNotes.find(note => note.id === savedCurrentNoteId)) {
            setCurrentNoteId(savedCurrentNoteId);
          } else {
            setCurrentNoteId(parsedNotes[0].id);
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке заметок из localStorage:', error);
      }
    }
  }, []);

  // Сохранение заметок в localStorage с задержкой в 1 секунду
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('textEditorNotes', JSON.stringify(notes));
      localStorage.setItem('textEditorCurrentNoteId', currentNoteId);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [notes, currentNoteId]);

  // Устанавливаем содержимое редактора при смене заметки
  useEffect(() => {
    if (editorRef.current && currentNote) {
      editorRef.current.innerHTML = currentNote.content;
      currentContentRef.current = currentNote.content;
    }
  }, [currentNoteId]); // Зависимость только от currentNoteId, а не от currentNote

  // Дебаунсинг для обновления состояния заметок
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentContentRef.current !== undefined) {
        // Сохраняем позицию курсора перед обновлением
        const selection = window.getSelection();
        let range = null;
        let startOffset = 0;
        let endOffset = 0;
        let startContainer = null;
        let endContainer = null;

        if (selection && selection.rangeCount > 0) {
          range = selection.getRangeAt(0);
          startContainer = range.startContainer;
          endContainer = range.endContainer;
          startOffset = range.startOffset;
          endOffset = range.endOffset;
        }

        // Обновляем состояние заметки
        updateNoteContent(currentContentRef.current);

        // Восстанавливаем позицию курсора после обновления
        setTimeout(() => {
          if (range && startContainer && endContainer && editorRef.current) {
            try {
              const newRange = document.createRange();
              newRange.setStart(startContainer, startOffset);
              newRange.setEnd(endContainer, endOffset);
              
              const newSelection = window.getSelection();
              if (newSelection) {
                newSelection.removeAllRanges();
                newSelection.addRange(newRange);
              }
            } catch (error) {
              // Если не удается восстановить точную позицию, устанавливаем курсор в конец
              console.warn('Не удалось восстановить позицию курсора:', error);
              if (editorRef.current) {
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(editorRef.current);
                range.collapse(false);
                if (selection) {
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              }
            }
          }
        }, 0);
      }
    }, 500); // Дебаунсинг 500мс

    return () => clearTimeout(timeoutId);
  }, [currentContentRef.current]); // Зависимость от содержимого ref

  // Обработчик клика для закрытия контекстного меню
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(prev => ({ ...prev, isOpen: false }));
    };

    if (contextMenu.isOpen) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu.isOpen]);

  const onSwitchNote = (noteId: string) => {
    setCurrentNoteId(noteId);
  };

  const onDeleteTab = (noteId: string) => {
    if (notes.length <= 1) return;
    
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    
    if (currentNoteId === noteId) {
      setCurrentNoteId(updatedNotes[0].id);
    }
  };

  const onAddTab = () => {
    const newId = Date.now().toString();
    const newNote: Note = {
      id: newId,
      title: `Документ ${notes.length + 1}`,
      content: ''
    };
    
    setNotes(prevNotes => [...prevNotes, newNote]);
    setCurrentNoteId(newId);
  };

  const currentNote = notes.find(note => note.id === currentNoteId);

  const updateNoteContent = (content: string) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === currentNoteId 
          ? { ...note, content }
          : note
      )
    );
  };

  const updateNoteTitle = (title: string) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === currentNoteId 
          ? { ...note, title }
          : note
      )
    );
  };

  // Функции для форматирования текста
  const handleFormatText = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      
      // Обновляем ref содержимого
      currentContentRef.current = editorRef.current.innerHTML;
    }
  };

  const handleSave = () => {
    if (currentNote) {
      // Сохранение в формате HTML
      const blob = new Blob([currentNote.content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentNote.title}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Показываем уведомление
      alert('Документ сохранен в формате HTML!');
    }
  };

  // Новая функция для сохранения в формате .txt
  const handleSaveAsTxt = () => {
    if (currentNote) {
      // Создаем временный элемент для извлечения чистого текста
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = currentNote.content;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      
      const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentNote.title}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Документ сохранен в формате TXT!');
    }
  };

  // Новая функция для поделиться записью через JSON
  const handleShareAsJson = () => {
    const dataToShare = {
      notes: notes,
      currentNoteId: currentNoteId,
      exportDate: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(dataToShare, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-editor-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Данные экспортированы в JSON!');
  };

  // Новая функция для импорта заметок из JSON
  const handleImportJson = (jsonString: string) => {
    try {
      const importedData = JSON.parse(jsonString);
      
      // Проверяем структуру данных
      if (importedData.notes && Array.isArray(importedData.notes) && importedData.notes.length > 0) {
        // Проверяем, что каждая заметка имеет необходимые поля
        const validNotes = importedData.notes.filter((note: any) => 
          note.id && note.title !== undefined && note.content !== undefined
        );
        
        if (validNotes.length > 0) {
          // Генерируем новые ID для избежания конфликтов
          const notesWithNewIds = validNotes.map((note: Note) => ({
            ...note,
            id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }));
          
          // Добавляем импортированные заметки к существующим
          setNotes(prevNotes => [...prevNotes, ...notesWithNewIds]);
          
          // Переключаемся на первую импортированную заметку
          setCurrentNoteId(notesWithNewIds[0].id);
          
          alert(`Успешно импортировано ${notesWithNewIds.length} заметок!`);
        } else {
          alert('В файле не найдено валидных заметок для импорта.');
        }
      } else {
        alert('Неверный формат JSON файла. Ожидается объект с массивом заметок.');
      }
    } catch (error) {
      console.error('Ошибка при импорте JSON:', error);
      alert('Ошибка при чтении JSON файла. Проверьте формат файла.');
    }
  };

  // Новая функция для вставки локального изображения
  const handleInsertLocalImage = (dataUrl: string) => {
    if (editorRef.current) {
      const imgHTML = `<img src="${dataUrl}" alt="Загруженное изображение" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
      editorRef.current.focus();
      document.execCommand('insertHTML', false, imgHTML);
      
      // Обновляем ref содержимого
      currentContentRef.current = editorRef.current.innerHTML;
    }
  };

  // Функции для работы с таблицами
  const handleInsertTable = () => {
    setTableDialog(true);
  };

  const insertTable = (values: Record<string, string>) => {
    const rows = parseInt(values.rows) || 3;
    const cols = parseInt(values.cols) || 3;
    
    let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;" class="editable-table">';
    
    for (let i = 0; i < rows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < cols; j++) {
        tableHTML += '<td style="padding: 8px; border: 1px solid #ccc; position: relative;">&nbsp;</td>';
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</table>';
    
    handleFormatText('insertHTML', tableHTML);
  };

  const handleInsertLink = () => {
    setLinkDialog(true);
  };

  const insertLink = (values: Record<string, string>) => {
    const url = values.url;
    const text = values.text;
    
    if (url && text) {
      const linkHTML = `<a href="${url}" target="_blank">${text}</a>`;
      handleFormatText('insertHTML', linkHTML);
    }
  };

  const handleInsertImage = () => {
    setImageDialog(true);
  };

  const insertImage = (values: Record<string, string>) => {
    const url = values.url;
    const alt = values.alt || 'Изображение';
    
    if (url) {
      const imgHTML = `<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
      handleFormatText('insertHTML', imgHTML);
    }
  };

  // Функции для работы с таблицами
  const findTableCell = (element: HTMLElement): HTMLTableCellElement | null => {
    let current = element;
    while (current && current !== editorRef.current) {
      if (current.tagName === 'TD' || current.tagName === 'TH') {
        return current as HTMLTableCellElement;
      }
      current = current.parentElement!;
    }
    return null;
  };

  const handleTableAction = (action: string) => {
    if (!contextMenu.targetCell) return;

    const cell = contextMenu.targetCell;
    const row = cell.parentElement as HTMLTableRowElement;
    const table = row.parentElement as HTMLTableElement;
    const cellIndex = Array.from(row.cells).indexOf(cell);
    const rowIndex = Array.from(table.rows).indexOf(row);

    switch (action) {
      case 'addRowAbove':
        const newRowAbove = table.insertRow(rowIndex);
        for (let i = 0; i < row.cells.length; i++) {
          const newCell = newRowAbove.insertCell();
          newCell.style.cssText = 'padding: 8px; border: 1px solid #ccc;';
          newCell.innerHTML = '&nbsp;';
        }
        break;

      case 'addRowBelow':
        const newRowBelow = table.insertRow(rowIndex + 1);
        for (let i = 0; i < row.cells.length; i++) {
          const newCell = newRowBelow.insertCell();
          newCell.style.cssText = 'padding: 8px; border: 1px solid #ccc;';
          newCell.innerHTML = '&nbsp;';
        }
        break;

      case 'deleteRow':
        if (table.rows.length > 1) {
          table.deleteRow(rowIndex);
        }
        break;

      case 'addColumnLeft':
        for (let i = 0; i < table.rows.length; i++) {
          const newCell = table.rows[i].insertCell(cellIndex);
          newCell.style.cssText = 'padding: 8px; border: 1px solid #ccc;';
          newCell.innerHTML = '&nbsp;';
        }
        break;

      case 'addColumnRight':
        for (let i = 0; i < table.rows.length; i++) {
          const newCell = table.rows[i].insertCell(cellIndex + 1);
          newCell.style.cssText = 'padding: 8px; border: 1px solid #ccc;';
          newCell.innerHTML = '&nbsp;';
        }
        break;

      case 'deleteColumn':
        if (row.cells.length > 1) {
          for (let i = 0; i < table.rows.length; i++) {
            table.rows[i].deleteCell(cellIndex);
          }
        }
        break;
    }

    // Обновляем содержимое
    currentContentRef.current = editorRef.current!.innerHTML;
  };

  // Обработка изменений в редакторе - теперь только обновляет ref
  const handleEditorChange = () => {
    if (editorRef.current) {
      currentContentRef.current = editorRef.current.innerHTML;
    }
  };

  // Обработка правого клика на таблице
  const handleContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const cell = findTableCell(target);
    
    if (cell) {
      e.preventDefault();
      setContextMenu({
        isOpen: true,
        position: { x: e.clientX, y: e.clientY },
        targetCell: cell
      });
    }
  };

  // Обработка горячих клавиш
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          handleSave();
          break;
        case 'b':
          e.preventDefault();
          handleFormatText('bold');
          break;
        case 'i':
          e.preventDefault();
          handleFormatText('italic');
          break;
        case 'u':
          e.preventDefault();
          handleFormatText('underline');
          break;
        case 'z':
          e.preventDefault();
          handleFormatText('undo');
          break;
        case 'y':
          e.preventDefault();
          handleFormatText('redo');
          break;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <TabsContainer
        notes={notes}
        currentNoteId={currentNoteId}
        onSwitchNote={onSwitchNote}
        onDeleteTab={onDeleteTab}
        onAddTab={onAddTab}
      />
      
      <RibbonMenu
        onFormatText={handleFormatText}
        onSave={handleSave}
        onSaveAsTxt={handleSaveAsTxt}
        onShareAsJson={handleShareAsJson}
        onImportJson={handleImportJson}
        onInsertTable={handleInsertTable}
        onInsertLink={handleInsertLink}
        onInsertImage={handleInsertImage}
        onInsertLocalImage={handleInsertLocalImage}
      />
      
      <div className="flex-1 bg-white">
        {currentNote && (
          <div className="h-full flex flex-col">
            {/* Заголовок документа */}
            <div className="border-b border-gray-200 p-4">
              <input
                type="text"
                value={currentNote.title}
                onChange={(e) => updateNoteTitle(e.target.value)}
                className="text-2xl font-bold w-full border-none outline-none bg-transparent"
                placeholder="Название документа..."
              />
            </div>
            
            {/* Область редактирования */}
            <div className="flex-1 p-4">
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorChange}
                onKeyDown={handleKeyDown}
                onContextMenu={handleContextMenu}
                className="w-full h-full outline-none text-gray-800 leading-relaxed"
                style={{ 
                  minHeight: 'calc(100vh - 300px)',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}
                suppressContentEditableWarning={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Диалоги */}
      <InputDialog
        isOpen={tableDialog}
        onClose={() => setTableDialog(false)}
        title="Вставить таблицу"
        fields={[
          { label: 'Количество строк:', defaultValue: '3', key: 'rows' },
          { label: 'Количество столбцов:', defaultValue: '3', key: 'cols' }
        ]}
        onSubmit={insertTable}
      />

      <InputDialog
        isOpen={linkDialog}
        onClose={() => setLinkDialog(false)}
        title="Вставить ссылку"
        fields={[
          { label: 'URL:', defaultValue: '', key: 'url' },
          { label: 'Текст ссылки:', defaultValue: '', key: 'text' }
        ]}
        onSubmit={insertLink}
      />

      <InputDialog
        isOpen={imageDialog}
        onClose={() => setImageDialog(false)}
        title="Вставить изображение"
        fields={[
          { label: 'URL изображения:', defaultValue: '', key: 'url' },
          { label: 'Описание:', defaultValue: 'Изображение', key: 'alt' }
        ]}
        onSubmit={insertImage}
      />

      {/* Контекстное меню для таблиц */}
      <TableContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
        onAction={handleTableAction}
      />
    </div>
  );
}

export default App;

