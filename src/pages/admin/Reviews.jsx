import { Star } from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import CrudForm from '../../components/ui/CrudForm';
import { useFetch } from '../../hooks/useFetch';
import { getReviews, createReview, updateReview, deleteReview } from '../../api/reviews';

const columns = [
  { key: 'name', label: 'Name' },
  {
    key: 'rating',
    label: 'Rating',
    render: (item) => (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className={`h-4 w-4 ${s <= (item.rating || 5) ? 'fill-accent text-accent' : 'text-border'}`} />
        ))}
      </div>
    ),
  },
  { key: 'position', label: 'Position' },
  {
    key: 'comment',
    label: 'Review',
    render: (item) => <span className="line-clamp-1">{item.comment || item.text || ''}</span>,
  },
];

const fields = [
  { key: 'name', label: 'Name', required: true },
  { key: 'position', label: 'Position' },
  { key: 'rating', label: 'Rating (1-5)', type: 'number' },
  { key: 'comment', label: 'Review', type: 'textarea', required: true },
];

export default function AdminReviews() {
  const { data, loading, error, refetch } = useFetch(getReviews);

  return (
    <DataTable
      title="Reviews"
      data={data || []}
      loading={loading}
      error={error}
      columns={columns}
      searchFields={['name', 'comment']}
      renderForm={(editing, onClose) => (
        <CrudForm
          fields={fields}
          initialData={editing}
          onSubmit={async (id, form) => {
            if (editing) {
              await updateReview(id, form);
            } else {
              await createReview(form);
            }
            refetch();
          }}
          onClose={onClose}
        />
      )}
    />
  );
}