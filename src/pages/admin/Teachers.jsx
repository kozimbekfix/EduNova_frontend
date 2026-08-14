import DataTable from '../../components/ui/DataTable';
import CrudForm from '../../components/ui/CrudForm';
import { useFetch } from '../../hooks/useFetch';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../../api/teachers';

const columns = [
  {
    key: 'image',
    label: 'Photo',
    render: (item) => (
      item.image
        ? <img src={item.image} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
        : <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{item.name?.[0] || '?'}</div>
    ),
  },
  { key: 'name', label: 'Name' },
  { key: 'subject', label: 'Subject' },
  { key: 'position', label: 'Position' },
];

const fields = [
  { key: 'name', label: 'Name', required: true },
  { key: 'subject', label: 'Subject' },
  { key: 'position', label: 'Position' },
  { key: 'bio', label: 'Bio', type: 'textarea' },
  { key: 'image', label: 'Image URL' },
];

export default function AdminTeachers() {
  const { data, loading, error, refetch } = useFetch(getTeachers);

  return (
    <DataTable
      title="Teachers"
      data={data || []}
      loading={loading}
      error={error}
      columns={columns}
      searchFields={['name', 'subject', 'position']}
      renderForm={(editing, onClose) => (
        <CrudForm
          fields={fields}
          initialData={editing}
          onSubmit={async (id, form) => {
            if (editing) {
              await updateTeacher(id, form);
            } else {
              await createTeacher(form);
            }
            refetch();
          }}
          onClose={onClose}
        />
      )}
    />
  );
}