import DataTable from '../../components/ui/DataTable';
import CrudForm from '../../components/ui/CrudForm';
import { useFetch } from '../../hooks/useFetch';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../api/courses';

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'price', label: 'Price' },
  { key: 'duration', label: 'Duration' },
  {
    key: 'createdAt',
    label: 'Added',
    render: (item) => item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US') : '-',
  },
];

const fields = [
  { key: 'title', label: 'Course name', required: true },
  { key: 'price', label: 'Price' },
  { key: 'duration', label: 'Duration' },
  { key: 'description', label: 'Tavsif', type: 'textarea' },
  { key: 'image', label: 'Image URL' },
];

export default function AdminCourses() {
  const { data, loading, error, refetch } = useFetch(getCourses);

  return (
    <DataTable
      title="Courses"
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