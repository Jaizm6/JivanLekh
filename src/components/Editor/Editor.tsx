import React from 'react';
import { Editor as BaseEditor } from '../Editor';
import { Card, Note, Notebook } from '../../types';

export interface LegacyEditorProps {
  note?: Note | null;
  card?: Card | null;
  notebook?: Notebook | null;
  onUpdate?: (updates: any) => void;
  onTrash?: () => void;
  onRestore?: () => void;
  onDeleteForever?: () => void;
}

export const Editor: React.FC<LegacyEditorProps> = (props) => {
  // Convert note to card if needed
  const card: Card | null = props.card || (props.note ? {
    id: props.note.id,
    notebookId: props.note.notebookId || props.note.nb || 'nb-personal',
    title: props.note.title,
    body: props.note.body,
    tags: props.note.tags || [],
    colorLabel: (props.note.color as any) || null,
    createdAt: props.note.createdAt || props.note.cre || Date.now(),
    updatedAt: props.note.updatedAt || props.note.upd || Date.now(),
    isTrashed: !!(props.note.isTrashed || props.note.trash)
  } : null);

  return (
    <BaseEditor
      card={card}
      notebook={props.notebook || null}
      onUpdateCard={(id, updates) => props.onUpdate?.(updates)}
      onTrashCard={() => props.onTrash?.()}
      onRestoreCard={() => props.onRestore?.()}
      onPermanentlyDeleteCard={() => props.onDeleteForever?.()}
      onAddTag={() => {}}
      onRemoveTag={() => {}}
      onShowToast={() => {}}
    />
  );
};

export default Editor;
