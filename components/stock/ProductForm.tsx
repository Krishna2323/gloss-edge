"use client";

import Link from "next/link";
import { Check, ChevronLeft, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { LOW_STOCK_DEFAULT } from "@/constants";
import { ROUTES } from "@/constants/routes";
import {
  createProduct,
  deleteProduct,
  editProduct,
} from "@/lib/actions/product.actions";
import type { ProductFormOptions } from "@/lib/actions/product.actions";
import { cn } from "@/lib/utils";
import { CreateProductSchema, EditProductSchema } from "@/lib/validations";
import { fieldClass, Label, QtyStepper } from "./fields";
import Swatch from "./Swatch";

const COLORS = [
  "#F4F1EA",
  "#C9C4BA",
  "#8A8A8F",
  "#1E1E20",
  "#C8A46B",
  "#8B5A2B",
  "#5A3A22",
  "#D4AF37",
  "#7A1F2B",
  "#1F3A5F",
  "#2F5D50",
];

interface Props {
  options: ProductFormOptions;
  product?: {
    _id: string;
    code: string;
    title: string;
    brand: string;
    description: string;
    categories: string[];
    color?: string;
    lowStockAt?: number;
    units: number;
  };
}

type Errors = Partial<Record<string, string>>;

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-5 px-5 pt-10">
    <h2 className="font-wide px-1 text-base font-black uppercase">{title}</h2>
    {children}
  </section>
);

const Field = ({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error ? (
      <p role="alert" className="text-xs font-semibold text-out">
        {error}
      </p>
    ) : (
      hint && <p className="text-xs text-fg-faint">{hint}</p>
    )}
  </div>
);

const ProductForm = ({ options, product }: Props) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = !!product;

  const [code, setCode] = useState(product?.code ?? "");
  const [title, setTitle] = useState(product?.title ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categories, setCategories] = useState(product?.categories ?? []);
  const [categoryInput, setCategoryInput] = useState("");
  const [color, setColor] = useState(product?.color);
  const [lowStockAt, setLowStockAt] = useState(
    product?.lowStockAt?.toString() ?? ""
  );
  const [cityId, setCityId] = useState(options.cities[0]?._id ?? "");
  const [startingStock, setStartingStock] = useState("0");
  const [remark, setRemark] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const clearError = (key: string) =>
    setErrors((e) => ({ ...e, [key]: undefined }));

  const backHref = isEdit ? ROUTES.PRODUCT(product._id) : "/products";
  const qty = isEdit ? product.units : Number(startingStock) || 0;

  const addCategory = (name: string) => {
    const value = name.trim();
    if (!value) return;
    if (categories.length >= 3) {
      setErrors((e) => ({ ...e, categories: "Up to 3 categories." }));
      return;
    }
    if (!categories.some((c) => c.toLowerCase() === value.toLowerCase())) {
      setCategories([...categories, value]);
    }
    setCategoryInput("");
    setErrors((e) => ({ ...e, categories: undefined }));
  };

  const term = categoryInput.trim().toLowerCase();
  const suggestions = options.categories
    .filter(
      (c) =>
        !categories.some((p) => p.toLowerCase() === c.toLowerCase()) &&
        (!term || c.toLowerCase().includes(term))
    )
    .slice(0, 8);

  const submit = () => {
    const fields = {
      code,
      title,
      brand,
      description,
      categories,
      color,
      lowStockAt: lowStockAt === "" ? undefined : Number(lowStockAt),
    };
    const parsed = isEdit
      ? EditProductSchema.safeParse({
          ...fields,
          productID: product._id,
          remark: remark || undefined,
        })
      : CreateProductSchema.safeParse({
          ...fields,
          startingStock: Number(startingStock) || 0,
          locationID: cityId || undefined,
        });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors(
        Object.fromEntries(
          Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0]])
        )
      );
      toast.error("Check the highlighted fields.");
      return;
    }
    setErrors({});

    startTransition(async () => {
      const result = isEdit
        ? await editProduct({
            ...fields,
            productID: product._id,
            remark: remark || undefined,
          })
        : await createProduct({
            ...fields,
            startingStock: Number(startingStock) || 0,
            locationID: cityId || undefined,
          });

      if (!result.success) {
        toast.error(result.error?.message ?? "Could not save the product.");
        return;
      }

      const id = isEdit ? product._id : (result.data as { _id: string })._id;
      toast.success(isEdit ? `${code.trim()} saved` : `${code.trim()} added`);
      router.push(ROUTES.PRODUCT(id));
      router.refresh();
    });
  };

  const remove = () => {
    if (!isEdit) return;
    startTransition(async () => {
      const result = await deleteProduct({ productID: product._id });
      if (!result.success) {
        toast.error(result.error?.message ?? "Could not delete the product.");
        return;
      }
      toast.success(`${product.code} deleted`);
      setConfirmDelete(false);
      router.push("/products");
      router.refresh();
    });
  };

  return (
    <>
      <header className="flex items-center gap-3.5 px-5">
        <Link
          href={backHref}
          aria-label="Back"
          className="flex size-11 shrink-0 items-center justify-center rounded-[14px] border border-white/[0.08] bg-raised text-fg shadow-raised"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="font-wide truncate text-[28px] font-black uppercase leading-none tracking-tight">
          {isEdit ? "Edit product" : "New product"}
        </h1>
      </header>

      <div
        aria-hidden="true"
        className="mx-4 mt-7 flex items-center gap-3.5 rounded-3xl border border-white/[0.06] bg-ink-900 p-[18px]"
      >
        <Swatch color={color} className="size-11 rounded-[13px]" />
        <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
          <span className="font-wide truncate text-base font-extrabold tracking-tight">
            {code.trim() || "CODE"}
          </span>
          <span className="truncate text-xs text-fg-muted">
            {title.trim() || "Title"} · {description.trim() || "Description"}
          </span>
        </div>
        <div className="flex min-w-16 shrink-0 flex-col items-end gap-1 text-right">
          <span className="font-wide text-xl font-extrabold tabular-nums">
            {qty}
          </span>
          <span className="whitespace-nowrap text-[10px] font-semibold tracking-[0.06em] text-fg-faint">
            UNITS
          </span>
        </div>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Section title="Details">
          <Field id="code" label="Code" error={errors.code}>
            <input
              id="code"
              value={code}
              autoComplete="off"
              autoCapitalize="characters"
              maxLength={100}
              placeholder="3013G"
              onChange={(e) => {
                setCode(e.target.value);
                clearError("code");
              }}
              className={cn(
                fieldClass,
                "font-wide text-lg font-extrabold placeholder:text-fg-faint"
              )}
            />
          </Field>
          <Field id="title" label="Title" error={errors.title}>
            <input
              id="title"
              value={title}
              maxLength={100}
              placeholder="PVC Edgeband"
              onChange={(e) => {
                setTitle(e.target.value);
                clearError("title");
              }}
              className={cn(fieldClass, "placeholder:text-fg-faint")}
            />
          </Field>
          <Field id="brand" label="Brand" error={errors.brand}>
            <input
              id="brand"
              list="brand-options"
              value={brand}
              maxLength={100}
              autoComplete="off"
              placeholder="Fixine"
              onChange={(e) => {
                setBrand(e.target.value);
                clearError("brand");
              }}
              className={cn(fieldClass, "placeholder:text-fg-faint")}
            />
            <datalist id="brand-options">
              {options.brands.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </Field>
          <Field
            id="description"
            label="Description"
            error={errors.description}
          >
            <input
              id="description"
              value={description}
              maxLength={200}
              placeholder="SOLID-G LIME"
              onChange={(e) => {
                setDescription(e.target.value);
                clearError("description");
              }}
              className={cn(fieldClass, "placeholder:text-fg-faint")}
            />
          </Field>
        </Section>

        <Section title="Categories">
          <Field
            id="category"
            label="Add category"
            error={errors.categories}
            hint="Up to 3. Tap a suggestion or type a new one."
          >
            <div className="flex gap-2.5">
              <input
                id="category"
                value={categoryInput}
                maxLength={30}
                autoComplete="off"
                placeholder="Edgeband"
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCategory(categoryInput);
                  }
                }}
                className={cn(fieldClass, "placeholder:text-fg-faint")}
              />
              <Button
                type="button"
                variant="raised"
                size="tap-icon"
                className="size-[52px] shrink-0"
                aria-label="Add category"
                disabled={!categoryInput.trim()}
                onClick={() => addCategory(categoryInput)}
              >
                <Plus />
              </Button>
            </div>
          </Field>

          {categories.length > 0 && (
            <ul aria-label="Chosen categories" className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    aria-label={`Remove ${c}`}
                    onClick={() =>
                      setCategories(categories.filter((x) => x !== c))
                    }
                    className="flex h-10 items-center gap-2 rounded-full border border-gold/40 bg-gold-chip pl-4 pr-3 text-sm font-bold text-gold"
                  >
                    {c}
                    <X aria-hidden="true" className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {suggestions.length > 0 && categories.length < 3 && (
            <ul aria-label="Suggestions" className="flex flex-wrap gap-2">
              {suggestions.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => addCategory(c)}
                    className="flex h-10 items-center rounded-full border border-white/[0.08] px-4 text-sm font-semibold text-fg-muted active:bg-white/5"
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Colour">
          <div
            role="radiogroup"
            aria-label="Colour"
            className="grid grid-cols-6 gap-3"
          >
            <button
              type="button"
              role="radio"
              aria-checked={!color}
              aria-label="No colour"
              onClick={() => setColor(undefined)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-2xl border text-[11px] font-bold text-fg-muted",
                !color
                  ? "border-gold shadow-[0_0_0_1px_rgba(245,196,81,0.6)]"
                  : "border-white/[0.08]"
              )}
            >
              NONE
            </button>
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={color === c}
                aria-label={`Colour ${c}`}
                onClick={() => setColor(c)}
                className={cn(
                  "relative aspect-square rounded-2xl border-2",
                  color === c ? "border-gold" : "border-transparent"
                )}
              >
                <Swatch color={c} className="size-full rounded-[14px]" />
                {color === c && (
                  <Check
                    aria-hidden="true"
                    className="absolute inset-0 m-auto size-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                  />
                )}
              </button>
            ))}
          </div>
          <p className="px-1 text-xs text-fg-faint">
            Optional. Shows as the swatch in lists.
          </p>
        </Section>

        <Section title="Low stock alert">
          <Field
            id="low-stock"
            label="Warn below"
            error={errors.lowStockAt}
            hint={`Leave empty to use the default of ${LOW_STOCK_DEFAULT}.`}
          >
            <input
              id="low-stock"
              inputMode="numeric"
              pattern="[0-9]*"
              value={lowStockAt}
              placeholder={String(LOW_STOCK_DEFAULT)}
              onChange={(e) => {
                setLowStockAt(e.target.value.replace(/\D/g, "").slice(0, 6));
                clearError("lowStockAt");
              }}
              className={cn(
                fieldClass,
                "font-wide text-lg font-extrabold tabular-nums placeholder:text-fg-faint"
              )}
            />
          </Field>
        </Section>

        {isEdit ? (
          <Section title="Stock">
            <p className="rounded-[20px] border border-white/[0.07] bg-tile p-5 text-sm text-fg-muted">
              Stock is changed from the product page with Stock in, Out and
              Move, so every change is recorded.
            </p>
            <Field id="remark" label="Note (optional)" error={errors.remark}>
              <input
                id="remark"
                value={remark}
                maxLength={100}
                placeholder="Why this change"
                onChange={(e) => {
                  setRemark(e.target.value);
                  clearError("remark");
                }}
                className={cn(fieldClass, "placeholder:text-fg-faint")}
              />
            </Field>
          </Section>
        ) : (
          <Section title="Starting stock">
            {options.cities.length > 0 ? (
              <>
                <Field id="city" label="City" error={errors.locationID}>
                  <select
                    id="city"
                    value={cityId}
                    onChange={(e) => {
                      setCityId(e.target.value);
                      clearError("locationID");
                    }}
                    className={cn(fieldClass, "appearance-none")}
                  >
                    {options.cities.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  id="starting-stock"
                  label="Units"
                  error={errors.startingStock}
                  hint="Leave at 0 to add stock later."
                >
                  <QtyStepper
                    id="starting-stock"
                    value={startingStock}
                    onChange={(v) => {
                      setStartingStock(v);
                      clearError("startingStock");
                    }}
                  />
                </Field>
              </>
            ) : (
              <p className="rounded-[20px] border border-white/[0.07] bg-tile p-5 text-sm text-fg-muted">
                Add a city first to give this product starting stock.
              </p>
            )}
          </Section>
        )}

        <div className="flex flex-col gap-3 px-5 pt-10">
          <Button type="submit" variant="gold" size="tap" disabled={pending}>
            {pending ? "Saving..." : isEdit ? "Save changes" : "Add product"}
          </Button>
          {isEdit && (
            <>
              <Button
                type="button"
                variant="raised"
                size="tap"
                disabled={pending || product.units > 0}
                onClick={() => setConfirmDelete(true)}
                className="text-out"
              >
                Delete product
              </Button>
              {product.units > 0 && (
                <p className="text-center text-xs text-fg-faint">
                  Move or remove its {product.units.toLocaleString("en-IN")}{" "}
                  units before deleting.
                </p>
              )}
            </>
          )}
        </div>
      </form>

      {isEdit && (
        <Sheet open={confirmDelete} onOpenChange={setConfirmDelete}>
          <SheetContent
            side="bottom"
            className="flex flex-col gap-5 rounded-t-[28px] border-white/10 bg-gradient-to-b from-[#1A1A1D] to-[#0C0C0E] px-5 pb-8 pt-3 font-archivo text-fg"
          >
            <span className="mx-auto h-[5px] w-10 shrink-0 rounded-full bg-ink-600" />
            <div className="flex flex-col gap-1 pr-8">
              <SheetTitle className="font-wide text-[22px] font-black uppercase text-fg">
                Delete {product.code}?
              </SheetTitle>
              <SheetDescription className="text-sm text-fg-muted">
                The product is removed from every list. Its past stock changes
                stay in history.
              </SheetDescription>
            </div>
            <Button
              type="button"
              variant="raised"
              size="tap"
              disabled={pending}
              onClick={remove}
              className="text-out"
            >
              {pending ? "Deleting..." : "Delete product"}
            </Button>
            <Button
              type="button"
              variant="raised"
              size="tap"
              disabled={pending}
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default ProductForm;
