import { useState } from "react";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronDown } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import MultiImageSelect from "../components/ImageSelect";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Company as ApiCompany } from "../types/Data";
import axiosInstance from "../utils/axios";
import toast from "react-hot-toast";
import { Button } from "../components/Button";

type UploadFormValues = {
  country: string;
  companyType: string;
  companyId: string;
  image: File | null; 
  type: string;
};

type Company = {
  _id: string;
  companyName: string;
  companyType: string;
  country: string;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function UploadSingleCompanyImage() {
  const { handleSubmit, reset, control, watch, setValue } = useForm<UploadFormValues>({
    defaultValues: {
      country: "",
      companyType: "",
      companyId: "",
      image: null,
      type: "",
    },
  });

  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await axiosInstance.get("/company/companies");
      return response.data as ApiCompany[];
    },
  });

  const countries = isLoading
    ? []
    : Array.from(new Set(companies?.map((c) => c.country)));
  const companyTypes = isLoading
    ? []
    : Array.from(new Set(companies?.map((c) => c.companyType)));

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: { companyId: string; image: File }) => {
      const formData = new FormData();
      formData.append("companyId", payload.companyId);
      formData.append("type", watch("type"));
      formData.append("image", payload.image);

      const res = await axiosInstance.post(
        "/company/add-company-image",
        formData
      );
      reset();
      return res.data;
    },
    onSuccess: () => {
      reset();
      setSelectedCompany(null);
      setSelectedType(null);
      toast.success("Images uploaded successfully!");
    },
    onError: (err) => {
      console.error("Error uploading:", err);
      toast.error(err instanceof Error ? err.message : "An error occurred");
    },
  });

  const selectedCountry = watch("country");

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const filteredCompanies = companies?.filter(
    (c) => c.companyType === selectedType && c.country === selectedCountry
  );

  return (
    <>
      {isLoading ? (
        <p>loading...</p>
      ) : (
        <form
          onSubmit={handleSubmit((data) => {
            if (!selectedCompany) return;

            mutate({
              companyId: selectedCompany._id,
              image: data.image as File,
            });
          })}
          className="w-full max-w-xl mx-auto space-y-6 p-6"
        >
          {/* Country Selector */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Country
            </label>
            <Listbox
              value={selectedCountry}
              onChange={(value) => {
                setSelectedCompany(null);
                setValue("country", value);
              }}
            >
              {() => (
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white border border-gray-300 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <span className="block truncate">
                      {selectedCountry || "Select country"}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {countries.map((country) => (
                      <Listbox.Option
                        key={country}
                        value={country}
                        className={({ active }) =>
                          classNames(
                            active
                              ? "bg-indigo-100 text-indigo-900"
                              : "text-gray-900",
                            "relative cursor-default select-none py-2 pl-10 pr-4"
                          )
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={classNames(
                                selected ? "font-semibold" : "font-normal",
                                "block truncate"
                              )}
                            >
                              {country}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              )}
            </Listbox>
          </div>

          {/* Company Type Selector */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Company Type
            </label>
            <Listbox
              value={selectedType}
              onChange={(value) => {
                setSelectedType(value);
                setSelectedCompany(null);
                setValue("companyType", value as string);
              }}
            >
              {() => (
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white border border-gray-300 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <span className="block truncate">
                      {selectedType ?? "Select company type"}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {companyTypes.map((type) => (
                      <Listbox.Option
                        key={type}
                        className={({ active }) =>
                          classNames(
                            active
                              ? "bg-indigo-100 text-indigo-900"
                              : "text-gray-900",
                            "relative cursor-default select-none py-2 pl-10 pr-4"
                          )
                        }
                        value={type}
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={classNames(
                                selected ? "font-semibold" : "font-normal",
                                "block truncate"
                              )}
                            >
                              {type}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              )}
            </Listbox>
          </div>

          {/* Company Name Selector */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Company Name
            </label>
            <Listbox
              value={selectedCompany}
              onChange={setSelectedCompany}
              disabled={!selectedType}
            >
              {() => (
                <div className="relative mt-1">
                  <Listbox.Button
                    className={classNames(
                      !selectedType
                        ? "bg-gray-100 cursor-not-allowed"
                        : "bg-white",
                      "relative w-full cursor-default rounded-md border border-gray-300 py-2 pl-3 pr-10 text-left shadow-sm sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    )}
                  >
                    <span className="block truncate">
                      {selectedCompany?.companyName ?? "Select company"}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronDown
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>
                  {selectedType && (
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {filteredCompanies?.map((company) => (
                        <Listbox.Option
                          key={company._id}
                          className={({ active }) =>
                            classNames(
                              active
                                ? "bg-indigo-100 text-indigo-900"
                                : "text-gray-900",
                              "relative cursor-default select-none py-2 pl-10 pr-4"
                            )
                          }
                          value={company}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={classNames(
                                  selected ? "font-semibold" : "font-normal",
                                  "block truncate"
                                )}
                              >
                                {company.companyName}
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  )}
                </div>
              )}
            </Listbox>
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Image Type
            </label>
            <Controller
              name="type"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Listbox value={field.value} onChange={field.onChange}>
                  {() => (
                    <div className="relative mt-1">
                      <Listbox.Button className="relative w-full cursor-default rounded-md bg-white border border-gray-300 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <span className="block truncate">
                          {field.value || "Select image type"}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        </span>
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {["image", "logo"].map((option) => (
                          <Listbox.Option
                            key={option}
                            value={option}
                            className={({ active }) =>
                              classNames(
                                active
                                  ? "bg-indigo-100 text-indigo-900"
                                  : "text-gray-900",
                                "relative cursor-default select-none py-2 pl-10 pr-4"
                              )
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={classNames(
                                    selected ? "font-semibold" : "font-normal",
                                    "block truncate"
                                  )}
                                >
                                  {option}
                                </span>
                                {selected && (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                    <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                )}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  )}
                </Listbox>
              )}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Company Images
            </label>
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <MultiImageSelect
                  value={field.value as File}
                  onChange={field.onChange}
                  maxFiles={12}
                  maxSizeMB={10}
                  disabled={!selectedCompany}
                  className="mt-1"
                />
              )}
            />
            {!selectedCompany && (
              <p className="mt-2 text-xs text-gray-500">
                Select a company first to attach images.
              </p>
            )}
          </div>

          {/* Submit */}
          <div>
            <Button type="submit" disabled={!selectedCompany || isPending}>
              {isPending ? "Uploading..." : "Submit"}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
