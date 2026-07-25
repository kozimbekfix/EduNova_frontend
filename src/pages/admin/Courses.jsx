import DataTable from '../../components/ui/DataTable';
import CrudForm from '../../components/ui/CrudForm';
import { useFetch } from '../../hooks/useFetch';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../api/courses';

const columns = [
  { key: 'title', label: 'Nomi' },
  { key: 'price', label: 'Narxi' },
  { key: 'duration', label: 'Davomiylik' },
  {
    key: 'createdAt',
    label: 'Qo\'shilgan',
    render: (item) => item.createdAt ? new Date(item.createdAt).toLocaleDateString('uz-UZ') : '-',
  },
];

const fields = [
  { key: 'title', label: 'Kurs nomi', required: true },
  { key: 'price', label: 'Narxi' },
  { key: 'duration', label: 'Davomiylik' },
  { key: 'description', label: 'Tavsif', type: 'textarea' },
  { key: 'image', label: 'Rasm URL' },
];

export default function AdminCourses() {
  const { data, loading, error, refetch } = useFetch(getCourses);

  return (
    <DataTable
      title="Kurslar"
      data={data || []}
      loading={loading}
      error={error}
      columns={columns}
      searchFields={['title', 'description']}
      renderForm={(editing, onClose) => (
        <CrudForm
          fields={fields}
          initialData={editing}
          onSubmit={async (id, form) => {
            if (editing) {
              await updateCourse(id, form);
            } else {
              await createCourse(form);
            }
            refetch();
          }}
          onClose={onClose}
        />
      )}
    />
  );
}