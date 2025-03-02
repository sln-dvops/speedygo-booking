import Image from "next/image"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { sanitizeFormData } from "@/utils/formUtils"

const addressSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  contactNumber: z.string().regex(/^[6-9]\d{7}$/, "Invalid Singapore phone number"),
  email: z.string().email("Invalid email address"),
  street: z.string().min(1, "Street is required").max(100),
  unitNo: z.string().min(1, "Unit number is required").max(20),
  postalCode: z.string().regex(/^\d{6}$/, "Invalid postal code"),
})

export type AddressFormData = z.infer<typeof addressSchema>

type AddressFormProps = {
  title: string
  nameLabel: string
  namePlaceholder: string
  onPrevStep: () => void
  onNextStep: (data: AddressFormData) => void
  defaultValues?: Partial<AddressFormData>
}

const defaultFormValues: AddressFormData = {
  name: "",
  contactNumber: "",
  email: "",
  street: "",
  unitNo: "",
  postalCode: "",
}

export function AddressForm({
  title,
  nameLabel,
  namePlaceholder,
  onPrevStep,
  onNextStep,
  defaultValues = {},
}: AddressFormProps) {
  const methods = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    mode: "onChange",
    defaultValues: { ...defaultFormValues, ...defaultValues },
  })

  const onSubmit = (data: AddressFormData) => {
    const sanitizedData = sanitizeFormData(data)
    onNextStep(sanitizedData)
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black">{title}</CardTitle>
      </CardHeader>
      <FormProvider {...methods}>
        <Form {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <CardContent className="p-6">
              <div className="space-y-6">
                <FormField
                  control={methods.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mb-2 flex items-center text-black">
                        <span className="text-black mr-1">*</span> {nameLabel}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={namePlaceholder} className="border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mb-2 flex items-center text-black">
                        <span className="text-black mr-1">*</span> Contact number
                      </FormLabel>
                      <FormControl>
                        <div className="flex h-[42px]">
                          <div className="border border-black rounded-l-md px-2 flex items-center bg-yellow-100 h-full">
                            <Image
                              src="/icons/sg-flag-rect.svg"
                              alt="Singapore flag"
                              width={30}
                              height={20}
                              className="mr-1"
                            />
                            <span className="text-sm text-black">+65</span>
                          </div>
                          <Input
                            {...field}
                            placeholder="Contact number"
                            className="rounded-l-none border-black h-full"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mb-2 flex items-center text-black">
                        <span className="text-black mr-1">*</span> Email address
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Email address" className="border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mb-2 flex items-center text-black">
                        <span className="text-black mr-1">*</span> Street name, building
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Street name, building" className="border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="unitNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mb-2 flex items-center text-black">
                        <span className="text-black mr-1">*</span> Unit no.
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Unit no." className="border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base mb-2 flex items-center text-black">
                        <span className="text-black mr-1">*</span> Postal code
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Postal code" className="border-black" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="px-6 py-4 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevStep}
                className="border-black text-black hover:bg-yellow-100"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="bg-black hover:bg-black/90 text-yellow-400"
                disabled={!methods.formState.isValid}
              >
                Next
              </Button>
            </CardFooter>
          </form>
        </Form>
      </FormProvider>
    </Card>
  )
}

