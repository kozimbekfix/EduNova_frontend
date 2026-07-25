import DataTable from '../../components/ui/DataTable';
import CrudForm from '../../components/ui/CrudForm';
import { useFetch } from '../../hooks/useFetch';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../../api/teachers';

const columns = [
  {
    key: 'image',
    label: 'Rasm',
    render: (item) => (
      item.image
        ? <img src={item.image} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
        : <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{item.name?.[0] || '?'}</div>
    ),
  },
  { key: 'name', label: 'Ism' },
  { key: 'subject', label: 'Fan' },
  { key: 'position', label: 'Lavozim' },
];

const fields = [
  { key: 'name', label: 'Ism', required: true },
  { key: 'subject', label: 'Fan' },
  { key: 'position', label: 'Lavozim' },
  { key: 'bio', label: 'Bio', type: 'textarea' },
  { key: 'image', label: 'Rasm URL' },
];

export default function AdminTeachers() {
  const { data, loading, error, refetch } = useFetch(getTeachers);

  return (
    <DataTable
      title="O'qituvchilar"
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