import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';

interface Widget {
  id: string;
  title: string;
  content: React.ReactNode;
}

const SortableWidget = ({ widget }: { widget: Widget }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm col-span-1 lg:col-span-1 flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
           {widget.title}
        </CardTitle>
        <button {...attributes} {...listeners} className="cursor-grab hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        {widget.content}
      </CardContent>
    </Card>
  );
};

export function WidgetContainer({ defaultWidgets }: { defaultWidgets: Widget[] }) {
  const [widgets, setWidgets] = useState(defaultWidgets);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={widgets.map(w => w.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map(widget => (
            <SortableWidget key={widget.id} widget={widget} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
