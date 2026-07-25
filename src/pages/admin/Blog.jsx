import DataTable from '../../components/ui/DataTable';
import CrudForm from '../../components/ui/CrudForm';
import { useFetch } from '../../hooks/useFetch';
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '../../api/blog';

const columns = [
  { key: 'title', label: 'Sarlavha' },
  {
    key: 'createdAt',
    label: 'Sana',
    render: (item) => item.createdAt ? new Date(item.createdAt).toLocaleDateString('uz-UZ') : '-',
  },
  {
    key: 'content',
    label: 'Matn',
    render: (item) => <span className="line-clamp-1">{item.content?.slice(0, 50) || ''}</span>,
  },
];

const fields = [
  { key: 'title', label: 'Sarlavha', required: true },
  { key: 'content', label: 'Matn', type: 'textarea', required: true },
  { key: 'image', label: 'Rasm URL' },
];

export default function AdminBlog() {
  const { data, loading, error, refetch } = useFetch(getBlogPosts);

  return (
    <DataTable
      title="Blog"
      data={data || []}
      loading={loading}
      error={error}
      columns={columns}
      searchFields={['title', 'content']}
      renderForm={(editing, onClose) => (
        <CrudForm
          fields={fields}
          initialData={editing}
          onSubmit={async (id, form) => {
            if (editing) {
              await updateBlogPost(id, form);
            } else {
              await createBlogPost(form);
            }
            refetch();
          }}
          onClose={onClose}
        />
      )}
    />
  );
}