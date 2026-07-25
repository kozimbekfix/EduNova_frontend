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
      onAdd={async (_, form) => { await createBlogPost(form); refetch(); }}
      onEdit={async (id, form) => { await updateBlogPost(id, form); refetch(); }}
      onDelete={async (id) => { await deleteBlogPost(id); refetch(); }}
      renderForm={(editing, onClose) => (
        <CrudForm fields={fields} initialData={editing} onSubmit={editing ? updateBlogPost : createBlogPost} onClose={onClose} />
      )}
    />
  );
}
